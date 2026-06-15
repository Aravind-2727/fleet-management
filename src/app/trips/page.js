'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
  },
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', gap: 16,
  },
  spinnerRing: {
    width: 56, height: 56, borderRadius: '50%',
    border: '1px solid rgba(124,99,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '2px solid rgba(124,99,255,0.1)',
    borderTop: '2px solid #7C63FF',
    animation: 'spin 0.8s linear infinite',
  },
  muted: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.45)', fontSize: 13,
  },

  shell: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },

  /* ── HEADER ── */
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 20px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },

  /* ── FORM CARD ── */
  formCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 24,
    marginBottom: 20, position: 'relative', overflow: 'hidden',
    boxSizing: 'border-box',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, margin: '0 0 18px',
  },
  field: { marginBottom: 14 },
  label: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
  },
  formActions: {
    display: 'flex', gap: 10, marginTop: 6,
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },

  /* ── TABLE ── */
  empty: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: '40px 0',
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.35)', fontSize: 13,
  },
  tableCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: {
    borderBottom: '1px solid rgba(20,20,30,0.05)',
  },
  td: {
    padding: '14px 20px',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  statusBadge: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#16A34A',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  deleteBtn: {
    background: 'rgba(224,82,74,0.1)',
    border: '1px solid rgba(224,82,74,0.25)',
    color: '#E0524A',
    padding: '7px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },
};

export default function TrucksPage({ user, onLogout }) {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [truckNumber, setTruckNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTrucks();
  }, []);

  const saveTruck = async () => {
    if (!truckNumber || truckNumber.trim().length < 2) {
      alert('Enter valid truck number (at least 2 characters)');
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    const { error } = await supabase
      .from('trucks')
      .insert([
        {
          owner_id: authUser.id,
          truck_number: truckNumber.trim(),
          status: 'Active',
          notes: notes.trim(),
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setTruckNumber('');
    setNotes('');
    setShowForm(false);

    fetchTrucks();

    alert('Truck added successfully');
  };

  const deleteTruck = async (id) => {
    if (!confirm('Are you sure you want to delete this truck?')) {
      return;
    }

    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTrucks();
  };

  const fetchTrucks = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setTrucks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTrucks(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading trucks...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Trucks Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Truck
          </button>
        </div>

        {/* ── ADD FORM ── */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Truck</h3>

            <div style={s.field}>
              <label style={s.label}>Truck Number</label>
              <input
                placeholder="e.g. TS09 AB 1234"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Notes</label>
              <input
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.formActions}>
              <button onClick={saveTruck} style={s.saveBtn}>Save Truck</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
        {trucks.length === 0 ? (
          <div style={s.empty}>No trucks found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Truck Number</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Notes</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} style={s.tr}>
                    <td style={s.td}>{truck.truck_number}</td>
                    <td style={s.td}>
                      <span style={s.statusBadge}>{truck.status}</span>
                    </td>
                    <td style={{ ...s.td, color: 'rgba(20,20,30,0.45)' }}>{truck.notes || '—'}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteTruck(truck.id)} style={s.deleteBtn}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(20,20,30,0.3); }
        input:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(20,20,30,0.1); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}