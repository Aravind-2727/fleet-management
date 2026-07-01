import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Production-grade driver creation endpoint.
 *
 * Security model:
 *   1. The request must be authenticated (session cookie).
 *   2. The authenticated user must have profiles.role === 'owner'.
 *   3. The caller's id (from the session) is used as fleet_owner_id —
 *      the client CANNOT supply an ownerId.
 *   4. Duplicate emails are rejected before any state is created.
 *   5. Rollback on partial failure: profile or drivers insert fails
 *      → delete the created auth user (and any partial row).
 */

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  /* ── 1. Authenticate using the session cookie ── */
  let supabase;
  try {
    const { createServerClient } = await import('@supabase/ssr');
    const cookieStore = await cookies();

    supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // We only read the session here—no cookies are set.
          setAll() {},
        },
      }
    );
  } catch (initError) {
    console.error('Session initialization failed:', initError);
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 500 }
    );
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  /* ── 2. Authorize — only fleet owners may create drivers ── */
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'owner') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  /* ── 3. Parse and validate body ── */
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { name, email, phone, password, payType, status } = payload;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  /* ── 4. Create admin client first (needed for duplicate checks) ── */
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  /* ── 5. Duplicate email guard ── */
  // Check auth.users through admin API
  const { data: { users: allUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  const existingAuthUser = allUsers?.find(u => u.email.toLowerCase() === normalizedEmail);
  if (listError) {
    console.error('Error listing users for duplicate check:', listError);
  } else if (existingAuthUser) {
    return NextResponse.json(
      { error: 'Driver account already exists.' },
      { status: 409 }
    );
  }

  // Check profiles table
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (existingProfile) {
    return NextResponse.json(
      { error: 'Driver account already exists.' },
      { status: 409 }
    );
  }

  /* ── 6. Create auth user (service role) ── */

  const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password: password.trim(),
    email_confirm: true,
    user_metadata: { name: name.trim() },
  });

  if (createUserError || !authData?.user) {
    console.error('Auth user creation failed:', createUserError);
    return NextResponse.json(
      { error: 'Failed to create driver account' },
      { status: 500 }
    );
  }

  const driverUserId = authData.user.id;
  let profileCreated = false;
  let driverCreated = false;

  try {
    /* ── 7. Create profile row ── */
    const { error: insertProfileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: driverUserId,
          email: normalizedEmail,
          role: 'driver',
          name: name.trim(),
          phone: phone?.trim() || '',
          fleet_owner_id: user.id,
        },
      ]);

    if (insertProfileError) {
      throw new Error(`Profile creation failed: ${insertProfileError.message}`);
    }

    profileCreated = true;

    /* ── 8. Create drivers table row ── */
    const { data: driverRow, error: driverInsertError } = await supabaseAdmin
      .from('drivers')
      .insert([
        {
          owner_id: user.id,
          profile_id: driverUserId,
          name: name.trim(),
          phone: phone?.trim() || '',
          email: normalizedEmail,
          pay_type: payType || 'per_trip',
          salary_amount: payType === 'monthly_salary' ? 0 : null,
          status: status || 'Active',
        },
      ])
      .select('id')
      .single();

    if (driverInsertError || !driverRow) {
      throw new Error(
        `Driver creation failed: ${driverInsertError?.message || 'Unknown error'}`
      );
    }

    driverCreated = true;

    /* ── 9. Success response ── */
    return NextResponse.json({
      success: true,
      driverId: driverRow.id,
      message: 'Driver created successfully',
    });
  } catch (error) {
    /* ── 10. Transaction rollback ── */
    if (profileCreated) {
      await supabaseAdmin.from('profiles').delete().eq('id', driverUserId);
    }

    if (driverCreated) {
      await supabaseAdmin.from('drivers').delete().eq('profile_id', driverUserId);
    }

    try {
      await supabaseAdmin.auth.admin.deleteUser(driverUserId);
    } catch (cleanupError) {
      console.error('Failed to clean up auth user during rollback:', cleanupError);
    }

    console.error('Driver creation transaction failed:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
