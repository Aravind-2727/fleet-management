import { supabase } from './supabase';

const BUCKET_NAME = 'documents';

export async function uploadDocument(file, entityId, entityType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${entityType}/${entityId}/${timestamp}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const documentData = {
    owner_id: user.id,
    bucket_name: BUCKET_NAME,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type,
    metadata: { size: file.size },
  };

  documentData[`${entityType}_id`] = entityId;

  const { data, error } = await supabase
    .from('documents')
    .insert([documentData])
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw error;
  }

  return data;
}

export async function uploadMultipleDocuments(files, entityId, entityType) {
  const results = [];
  for (const file of files) {
    const doc = await uploadDocument(file, entityId, entityType);
    results.push(doc);
  }
  return results;
}

export async function getDocuments(entityId, entityType) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq(`${entityType}_id`, entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createSignedUrl(filePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function downloadDocument(filePath, fileName) {
  const signedUrl = await createSignedUrl(filePath);
  const link = document.createElement('a');
  link.href = signedUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function deleteDocument(documentId, filePath) {
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (dbError) throw dbError;

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (storageError) throw storageError;

  return true;
}

export function getFileIcon(fileType) {
  if (!fileType) return 'ti ti-file';
  if (fileType.startsWith('image/')) return 'ti ti-file-image';
  if (fileType === 'application/pdf') return 'ti ti-file-type-pdf';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'ti ti-file-spreadsheet';
  if (fileType.includes('word') || fileType.includes('document')) return 'ti ti-file-type-doc';
  return 'ti ti-file';
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}