'use client';

import { useState } from 'react';

export default function CompanySettings() {
  const [formData, setFormData] = useState({
    companyName: 'Fleet Management Solutions',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Avenue, Suite 100',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    taxId: 'EIN-123456789',
    website: 'https://fleet-management.com',
    logo: null,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>Company Settings</h2>
      <p style={s.sectionDescription}>Manage your company information and branding.</p>

      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.formLabel}>Company Name</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            style={s.formInput}
            placeholder="Enter company name"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Company Phone</label>
          <input
            type="tel"
            value={formData.companyPhone}
            onChange={(e) => handleChange('companyPhone', e.target.value)}
            style={s.formInput}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Company Address</label>
          <textarea
            value={formData.companyAddress}
            onChange={(e) => handleChange('companyAddress', e.target.value)}
            style={{ ...s.formInput, minHeight: 80, resize: 'vertical' }}
            placeholder="Enter company address"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            style={s.formInput}
            placeholder="City"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>State/Province</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            style={s.formInput}
            placeholder="NY"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>ZIP/Postal Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            style={s.formInput}
            placeholder="10001"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Country</label>
          <select
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            style={s.formSelect}
          >
            <option value="USA">United States</option>
            <option value="CAN">Canada</option>
            <option value="MEX">Mexico</option>
            <option value="GBR">United Kingdom</option>
            <option value="AUS">Australia</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Tax ID/EIN</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            style={s.formInput}
            placeholder="EIN-123456789"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            style={s.formInput}
            placeholder="https://example.com"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Company Logo</label>
          <div style={s.logoUploadContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={s.logoInput}
            />
            <div style={s.logoPreview}>
              {formData.logo ? (
                <img
                  src={URL.createObjectURL(formData.logo)}
                  alt="Company Logo"
                  style={s.logoImage}
                />
              ) : (
                <div style={s.logoPlaceholder}>
                  <i className="ti ti-upload" style={{ fontSize: 32, color: 'rgba(20,20,30,0.3)' }} />
                  <p style={s.logoPlaceholderText}>Click to upload logo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  section: { marginBottom: 40 },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, margin: '0 0 8px',
  },
  sectionDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.6)', margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20, marginTop: 24,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  formLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.5)',
  },
  formInput: {
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
  formSelect: {
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
  logoUploadContainer: {
    position: 'relative',
  },
  logoInput: {
    opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer',
  },
  logoPreview: {
    border: '2px dashed rgba(20,20,30,0.2)',
    borderRadius: 12, padding: 24,
    background: 'rgba(124,99,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 120,
  },
  logoImage: {
    maxWidth: '100%', maxHeight: 80, objectFit: 'contain',
  },
  logoPlaceholder: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  logoPlaceholderText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.5)', margin: 0,
  },
};