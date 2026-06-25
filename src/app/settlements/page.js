'use client';

import { useEffect, useState, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { uploadMultipleDocuments, getDocuments, createSignedUrl, downloadDocument, deleteDocument, getFileIcon, formatFileSize } from '../lib/documents';
import DashboardLayout from '../../components/dashboard/layout';
import Modal from '../../components/common/Modal';

export default function SettlementsPage({ user, onLogout }) {
  const [settlements, setSettlements] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [settlementFiles, setSettlementFiles] = useState([]);
  const [settlementDocuments, setSettlementDocuments] = useState({});
  const [expandedSettlementId, setExpandedSettlementId] = useState(null);
  const [docLoading, setDocLoading] = useState({});

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const [formData, setFormData] = useState({
    driverId: '',
    tripId: '',
    earnings: '',
    reimbursableExpenses: '0',
    advancesDeducted: '0',
    netPayable: '',
    paymentStatus: 'pending',
    paymentMode: '',
    paymentDate: '',
  });

  const computedNetPayable = (() => {
    const earnings = parseFloat(formData.earnings) || 0;
    const reimbursable = parseFloat(formData.reimbursableExpenses) || 0;
    const advances = parseFloat(formData.advancesDeducted) || 0;
    const calculated = earnings + reimbursable - advances;
    return calculated > 0 ? calculated.toFixed(2) : '';
  })();

  const [summary, setSummary] = useState({
    totalSettlements: 0,
    totalPending: 0,
    totalPaid: 0,
    totalNetPayable: 0,
  });

  useEffect(() => {
    fetchSettlements();
    fetchDrivers();
    fetchTrips();
  }, []);

  const fetchSettlements = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setSettlements([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('settlements')
        .select(`
          id,
          driver_id,
          trip_id,
          earnings,
          reimbursable_expenses,
          advances_deducted,
          net_payable,
          payment_status,
          payment_mode,
          payment_date,
          created_at
        `)
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching settlements:', error);
      } else {
        setSettlements(data || []);
        calculateSummary(data || []);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (settlementsData) => {
    const totalSettlements = settlementsData.length;
    const totalPending = settlementsData
      .filter(s => s.payment_status === 'pending')
      .reduce((sum, s) => sum + (s.net_payable || 0), 0);
    const totalPaid = settlementsData
      .filter(s => s.payment_status === 'paid')
      .reduce((sum, s) => sum + (s.net_payable || 0), 0);
    const totalNetPayable = settlementsData
      .reduce((sum, s) => sum + (s.net_payable || 0), 0);

    setSummary({ totalSettlements, totalPending, totalPaid, totalNetPayable });
  };

  const fetchDrivers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setDrivers([]); return; }

      const { data, error } = await supabase
        .from('drivers')
        .select('id,name')
        .eq('owner_id', authUser.id)
        .eq('status', 'Active');

      if (error) console.error('Error fetching drivers:', error);
      else setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setTrips([]); return; }

      const { data, error } = await supabase
        .from('trips')
        .select('id, origin, destination, customer, status, close_status')
        .eq('owner_id', authUser.id);

      if (error) console.error('Error fetching trips:', error);
      else setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchSettlementDocuments = async (settlementId) => {
    try {
      const docs = await getDocuments(settlementId, 'settlement');
      setSettlementDocuments(prev => ({ ...prev, [settlementId]: docs }));
    } catch (error) {
      console.error('Error fetching settlement documents:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSettlementFiles(prev => [...prev, ...files]);
  };

  const removeSettlementFile = (index) => {
    setSettlementFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewDocument = async (filePath, fileName) => {
    try {
      const signedUrl = await createSignedUrl(filePath);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error creating preview URL:', error);
      alert('Failed to open document preview');
    }
  };

  const handleDownloadDocument = async (filePath, fileName) => {
    try {
      await downloadDocument(filePath, fileName);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId, filePath, settlementId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      setDocLoading(prev => ({ ...prev, [documentId]: true }));
      await deleteDocument(documentId, filePath);
      const updatedDocs = settlementDocuments[settlementId].filter(d => d.id !== documentId);
      setSettlementDocuments(prev => ({ ...prev, [settlementId]: updatedDocs }));
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDocLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const toggleSettlementExpand = (settlementId) => {
    setExpandedSettlementId(prev => prev === settlementId ? null : settlementId);
    if (expandedSettlementId !== settlementId && !settlementDocuments[settlementId]) {
      fetchSettlementDocuments(settlementId);
    }
  };

  const saveSettlement = async () => {
    if (!formData.driverId || !formData.tripId || !computedNetPayable) {
      alert('Please fill all required fields');
      return;
    }

    const parsedEarnings = parseFloat(formData.earnings) || 0;
    const parsedReimbursableExpenses = parseFloat(formData.reimbursableExpenses) || 0;
    const parsedAdvancesDeducted = parseFloat(formData.advancesDeducted) || 0;
    const parsedNetPayable = parseFloat(computedNetPayable);

    if (isNaN(parsedNetPayable) || parsedNetPayable <= 0) {
      alert('Please enter a valid positive net payable amount');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Not authenticated. Please login again.');
        return;
      }

      const { data: settlementData, error } = await supabase
        .from('settlements')
        .insert([{
          owner_id: authUser.id,
          driver_id: formData.driverId,
          trip_id: formData.tripId,
          earnings: parsedEarnings,
          reimbursable_expenses: parsedReimbursableExpenses,
          advances_deducted: parsedAdvancesDeducted,
          net_payable: parsedNetPayable,
          payment_status: formData.paymentStatus,
          payment_mode: formData.paymentMode || null,
          payment_date: formData.paymentDate || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating settlement:', error);
        alert(error.message);
        return;
      }

      if (settlementFiles.length > 0) {
        try {
          await uploadMultipleDocuments(settlementFiles, settlementData.id, 'settlement');
        } catch (uploadError) {
          console.error('Error uploading proofs:', uploadError);
          alert('Settlement created but some proofs failed to upload');
        }
      }

      await supabase
        .from('trips')
        .update({ status: 'pending_settlement' })
        .eq('id', formData.tripId);

      setFormData({
        driverId: '',
        tripId: '',
        earnings: '',
        reimbursableExpenses: '0',
        advancesDeducted: '0',
        paymentStatus: 'pending',
        paymentMode: '',
        paymentDate: '',
      });
      setSettlementFiles([]);
      setShowForm(false);
      fetchSettlements();
      alert('Settlement created successfully');
    } catch (error) {
      console.error('Error creating settlement:', error);
      alert('Failed to create settlement. Please try again.');
    }
  };

  const updateSettlementStatus = async (id, newStatus) => {
    try {
      const updateData = { payment_status: newStatus };
      if (newStatus === 'paid') {
        updateData.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('settlements')
        .update(updateData)
        .eq('id', id);

      if (error) { alert(error.message); return; }

      fetchSettlements();
      alert(`Settlement updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating settlement status:', error);
      alert('Failed to update settlement status. Please try again.');
    }
  };

  const deleteSettlement = async (id) => {
    if (!confirm('Are you sure you want to delete this settlement?')) return;

    try {
      const { error } = await supabase
        .from('settlements')
        .delete()
        .eq('id', id);

      if (error) { alert(error.message); return; }

      fetchSettlements();
      alert('Settlement deleted successfully');
    } catch (error) {
      console.error('Error deleting settlement:', error);
      alert('Failed to delete settlement. Please try again.');
    }
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unknown';
  };

  const getTripInfo = (id) => {
    const trip = trips.find(t => t.id === id);
    return trip ? `${trip.origin} → ${trip.destination}` : 'Unknown';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { color: '#FB923C', bg: '#FB923C15' };
      case 'paid':    return { color: '#22C55E', bg: '#22C55E15' };
      case 'partial': return { color: '#3B82F6', bg: '#3B82F615' };
      default:        return { color: '#6B7280', bg: '#6B728015' };
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading settlements...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Settlements Management</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Settlement
          </button>
        </div>

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#7C63FF' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Settlements</p>
              <h3 style={s.summaryValue}>{summary.totalSettlements}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Pending</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalPending)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-check" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Paid</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalPaid)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-currency-rupee" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Net Payable</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalNetPayable)}</h3>
            </div>
          </div>
        </div>

        {/* Form */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Create New Settlement</h3>
            <div style={s.formGrid}>

              <div style={s.formField}>
                <label style={s.label}>Driver</label>
                <select value={formData.driverId} onChange={(e) => setFormData({...formData, driverId: e.target.value})} style={s.input}>
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Trip</label>
                <select value={formData.tripId} onChange={(e) => setFormData({...formData, tripId: e.target.value})} style={s.input}>
                  <option value="">Select Trip</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Earnings (₹)</label>
                <input type="number" placeholder="e.g. 5000" value={formData.earnings}
                  onChange={(e) => setFormData({...formData, earnings: e.target.value})} style={s.input} />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Reimbursable Expenses (₹)</label>
                <input type="number" placeholder="e.g. 800" value={formData.reimbursableExpenses}
                  onChange={(e) => setFormData({...formData, reimbursableExpenses: e.target.value})} style={s.input} />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Advances Deducted (₹)</label>
                <input type="number" placeholder="e.g. 200" value={formData.advancesDeducted}
                  onChange={(e) => setFormData({...formData, advancesDeducted: e.target.value})} style={s.input} />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Net Payable (₹)</label>
                <input
                  type="number"
                  placeholder="Auto-calculated"
                  value={computedNetPayable}
                  readOnly
                  style={{ ...s.input, background: 'rgba(20,20,30,0.04)', cursor: 'not-allowed' }}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Payment Status</label>
                <select value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} style={s.input}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Payment Mode</label>
                <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} style={s.input}>
                  <option value="">Select Mode</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Payment Date</label>
                <input type="date" value={formData.paymentDate}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} style={s.input} />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Proof Documents</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ ...s.input, padding: 8, background: '#fff' }}
                />
                {settlementFiles.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {settlementFiles.map((file, index) => (
                      <span key={index} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 8,
                        background: 'rgba(124,99,255,0.1)', fontSize: 12,
                        color: '#7C63FF', fontFamily: "'Outfit', sans-serif"
                      }}>
                        <i className="ti ti-file" style={{ fontSize: 14 }} />
                        {file.name}
                        <button type="button" onClick={() => removeSettlementFile(index)} style={{
                          background: 'none', border: 'none', color: '#7C63FF',
                          cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <div style={s.formActions}>
              <button onClick={saveSettlement} style={s.saveBtn}>Save Settlement</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Table */}
        {settlements.length === 0 ? (
          <div style={s.empty}>No settlements found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Driver</th>
                  <th style={s.th}>Trip</th>
                  <th style={s.th}>Driver Earnings</th>
                  <th style={s.th}>Net Payable</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Payment Mode</th>
                  <th style={s.th}>Proofs</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <Fragment key={settlement.id}>
                    <tr
                      onClick={() => toggleSettlementExpand(settlement.id)}
                      style={{ ...s.tr, cursor: 'pointer' }}
                    >
                      <td style={s.td}>{getDriverName(settlement.driver_id)}</td>
                    <td style={s.td}>{getTripInfo(settlement.trip_id)}</td>
                    <td style={s.td}>{formatCurrency(settlement.earnings || 0)}</td>
                    <td style={s.td}>{formatCurrency(settlement.net_payable || 0)}</td>
                    <td style={s.td}>
                      <select
                        value={settlement.payment_status}
                        onChange={(e) => updateSettlementStatus(settlement.id, e.target.value)}
                        style={{
                          ...s.statusSelect,
                          backgroundColor: getStatusBadge(settlement.payment_status).bg,
                          color: getStatusBadge(settlement.payment_status).color,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                      </select>
                    </td>
                    <td style={s.td}>{settlement.payment_mode || '—'}</td>
                    <td style={s.td}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 8,
                        background: 'rgba(124,99,255,0.08)',
                        fontSize: 12, color: '#7C63FF',
                        fontFamily: "'Outfit', sans-serif",
                      }} onClick={(e) => { e.stopPropagation(); toggleSettlementExpand(settlement.id); }}>
                        <i className="ti ti-file" style={{ fontSize: 14 }} />
                        {settlementDocuments[settlement.id]?.length || 0}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteSettlement(settlement.id)} style={s.deleteBtn}>Delete</button>
                    </td>
                    </tr>
                    {expandedSettlementId === settlement.id && (
                      <tr style={s.expandedRow}>
                        <td colSpan={8} style={{ padding: '16px 20px', background: '#FAFAFD' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1F' }}>
                              Proof Documents
                            </h4>
                            <label style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 8,
                              background: '#7C63FF', color: '#fff',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              fontFamily: "'Outfit', sans-serif",
                            }}>
                              <i className="ti ti-upload" style={{ fontSize: 14 }} />
                              Upload
                              <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length === 0) return;
                                  try {
                                    await uploadMultipleDocuments(files, settlement.id, 'settlement');
                                    fetchSettlementDocuments(settlement.id);
                                    alert('Proofs uploaded successfully');
                                  } catch (err) {
                                    console.error('Error uploading proofs:', err);
                                    alert('Failed to upload proofs');
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(settlementDocuments[settlement.id] || []).length === 0 ? (
                              <p style={{ margin: 0, fontSize: 13, color: 'rgba(20,20,30,0.45)', fontFamily: "'Space Grotesk', sans-serif" }}>
                                No proof documents uploaded yet
                              </p>
                            ) : (
                              (settlementDocuments[settlement.id] || []).map(doc => (
                                <div key={doc.id} style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 14px', borderRadius: 10,
                                  background: '#fff', border: '1px solid rgba(20,20,30,0.06)',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                    <i className={getFileIcon(doc.file_type)} style={{ fontSize: 20, color: '#7C63FF' }} />
                                    <div style={{ minWidth: 0 }}>
                                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: '#1A1A1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {doc.file_name}
                                      </p>
                                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(20,20,30,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {formatFileSize(doc.metadata?.size || 0)} · {new Date(doc.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => handlePreviewDocument(doc.file_path, doc.file_name)} style={s.docPreviewBtn} title="Preview">
                                      <i className="ti ti-eye" style={{ fontSize: 16 }} />
                                    </button>
                                    <button onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)} style={s.docDownloadBtn} title="Download">
                                      <i className="ti ti-download" style={{ fontSize: 16 }} />
                                    </button>
                                    <button onClick={() => handleDeleteDocument(doc.id, doc.file_path, settlement.id)} style={s.docDeleteBtn} title="Delete" disabled={docLoading[doc.id]}>
                                      <i className="ti ti-trash" style={{ fontSize: 16 }} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

const s = {
  root: { fontFamily: "'Outfit', sans-serif", background: '#F7F7FA', minHeight: '100vh', color: '#1A1A1F' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 },
  spinnerRing: { width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(124,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(124,99,255,0.1)', borderTop: '2px solid #7C63FF', animation: 'spin 0.8s linear infinite' },
  muted: { fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)', fontSize: 13 },
  shell: { maxWidth: 1200, margin: '0 auto', padding: 20, boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  headerSub: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 6px' },
  headerTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5 },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#7C63FF', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 20px rgba(124,99,255,0.25)', whiteSpace: 'nowrap', minHeight: 44 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 },
  summaryCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(124,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryLabel: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 4px' },
  summaryValue: { fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1F' },
  formCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: 20, marginBottom: 20, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)' },
  formTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, margin: '0 0 16px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, marginBottom: 20 },
  formField: { marginBottom: 14 },
  label: { display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(20,20,30,0.1)', background: '#F7F7FA', fontSize: 14, fontFamily: "'Outfit', sans-serif", color: '#1A1A1F', boxSizing: 'border-box', transition: 'all 0.15s', minHeight: 44 },
  formActions: { display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  saveBtn: { background: '#22C55E', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", minHeight: 44 },
  cancelBtn: { background: '#fff', color: 'rgba(20,20,30,0.5)', border: '1px solid rgba(20,20,30,0.1)', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", minHeight: 44 },
  empty: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: '40px 0', textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.35)', fontSize: 13 },
  tableCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, overflow: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
  th: { textAlign: 'left', padding: '12px 16px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', borderBottom: '1px solid rgba(20,20,30,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  statusSelect: { border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 32, minHeight: 28 },
  deleteBtn: { background: 'rgba(224,82,74,0.1)', border: '1px solid rgba(224,82,74,0.25)', color: '#E0524A', padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif", minHeight: 34 },
  expandedRow: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  docPreviewBtn: { background: 'rgba(124,99,255,0.1)', border: '1px solid rgba(124,99,255,0.2)', color: '#7C63FF', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  docDownloadBtn: { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  docDeleteBtn: { background: 'rgba(224,82,74,0.1)', border: '1px solid rgba(224,82,74,0.2)', color: '#E0524A', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
};