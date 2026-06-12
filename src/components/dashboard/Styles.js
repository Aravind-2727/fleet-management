'use client';

import { useEffect } from 'react';

export default function Styles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
      @keyframes spin { to { transform: rotate(360deg); } }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: rgba(20,20,30,0.1); border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }

      @media (max-width: 1000px) {
        .dash-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 700px) {
        .dash-stat-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 900px) {
        .expenses-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 600px) {
        .expenses-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 900px) {
        .drivers-summary { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 600px) {
        .drivers-summary { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 1200px) {
        .notifications-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 900px) {
        .notifications-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}