'use client';

import { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, children }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    animation: 'fadeIn 0.15s ease',
  },
  dialog: {
    background: '#fff',
    borderRadius: 18,
    position: 'relative',
    width: '100%',
    maxWidth: 640,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    animation: 'scaleIn 0.15s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(20,20,30,0.06)',
    color: 'rgba(20,20,30,0.5)',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1,
  },
};
