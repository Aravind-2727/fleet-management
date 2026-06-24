'use client';

export default function Header({ user, onMenuClick, title = 'Dashboard', subtitle = 'Overview' }) {
  return (
    <>
      <style>{`
        .hdr-menu-btn { display: none !important; }
        .hdr-email    { max-width: 220px; }

        @media (max-width: 768px) {
          .hdr-menu-btn  { display: flex !important; }
          .hdr-title     { font-size: 18px !important; }
          .hdr-email     { max-width: 130px; font-size: 12px !important; }
        }
      `}</style>

      <div style={s.header}>
        <div style={s.headerLeft}>
          <button
            onClick={onMenuClick}
            style={s.menuBtn}
            className="hdr-menu-btn"
            aria-label="Open menu"
          >
            <i className="ti ti-menu-2" style={{ fontSize: 22 }} />
          </button>
          <div>
            <p style={s.headerSub}>{subtitle}</p>
            <h1 style={s.headerTitle} className="hdr-title">{title}</h1>
          </div>
        </div>

        <div style={s.headerRight}>
          <span style={s.userEmail} className="hdr-email" title={user?.email}>
            {user?.email}
          </span>
        </div>
      </div>
    </>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  menuBtn: {
    background: 'none', border: 'none',
    color: 'rgba(20,20,30,0.6)', cursor: 'pointer',
    padding: 6, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 4px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  userEmail: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.5)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};