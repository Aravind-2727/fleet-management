'use client';

export default function ReportFilters({
  dateRange,
  setDateRange,
  selectedDriver,
  setSelectedDriver,
  selectedTruck,
  setSelectedTruck,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  drivers,
  trucks,
  statusOptions,
}) {
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={s.filtersContainer}>
      <div style={s.filtersGrid}>
        {/* ── DATE RANGE ── */}
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Date Range</label>
          <div style={s.dateRangeContainer}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              style={s.dateInput}
            />
            <span style={s.dateSeparator}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              style={s.dateInput}
            />
          </div>
        </div>

        {/* ── DRIVER ── */}
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Driver</label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            style={s.filterSelect}
          >
            <option value="">All Drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.profiles?.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── TRUCK ── */}
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Truck</label>
          <select
            value={selectedTruck}
            onChange={(e) => setSelectedTruck(e.target.value)}
            style={s.filterSelect}
          >
            <option value="">All Trucks</option>
            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.truck_number}
              </option>
            ))}
          </select>
        </div>

        {/* ── STATUS ── */}
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={s.filterSelect}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── SEARCH ── */}
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Search</label>
          <div style={s.searchContainer}>
            {/* Icon absolutely positioned inside input */}
            <i
              className="ti ti-search"
              style={s.searchIcon}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={s.searchInput}
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTERS ── */}
      {(dateRange.start || dateRange.end || selectedDriver || selectedTruck || selectedStatus || searchQuery) && (
        <div style={s.activeFilters}>
          <span style={s.activeFiltersLabel}>Active Filters:</span>
          {dateRange.start && (
            <span style={s.filterTag}>
              From: {new Date(dateRange.start).toLocaleDateString()}
              <button onClick={() => setDateRange(prev => ({ ...prev, start: '' }))} style={s.filterTagRemove}>×</button>
            </span>
          )}
          {dateRange.end && (
            <span style={s.filterTag}>
              To: {new Date(dateRange.end).toLocaleDateString()}
              <button onClick={() => setDateRange(prev => ({ ...prev, end: '' }))} style={s.filterTagRemove}>×</button>
            </span>
          )}
          {selectedDriver && (
            <span style={s.filterTag}>
              Driver: {drivers.find(d => d.id === selectedDriver)?.profiles?.name || selectedDriver}
              <button onClick={() => setSelectedDriver('')} style={s.filterTagRemove}>×</button>
            </span>
          )}
          {selectedTruck && (
            <span style={s.filterTag}>
              Truck: {trucks.find(t => t.id === selectedTruck)?.truck_number || selectedTruck}
              <button onClick={() => setSelectedTruck('')} style={s.filterTagRemove}>×</button>
            </span>
          )}
          {selectedStatus && (
            <span style={s.filterTag}>
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus('')} style={s.filterTagRemove}>×</button>
            </span>
          )}
          {searchQuery && (
            <span style={s.filterTag}>
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')} style={s.filterTagRemove}>×</button>
            </span>
          )}
          <button onClick={() => {
            setDateRange({ start: '', end: '' });
            setSelectedDriver('');
            setSelectedTruck('');
            setSelectedStatus('');
            setSearchQuery('');
          }} style={s.clearAllBtn}>
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  filtersContainer: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
  },

  // FIX 1: 5 equal columns so Search doesn't wrap to a second row
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 20,
    alignItems: 'end', // vertically align all filter groups at bottom
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  filterLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.5)',
  },

  // FIX 4: explicit height to normalize across browsers
  filterSelect: {
    height: 46,
    padding: '0 14px',
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
    cursor: 'pointer',
    appearance: 'auto',
  },

  dateRangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  // FIX 2: flex:1 so both date inputs share space equally + fixed height
  dateInput: {
    flex: 1,
    height: 46,
    padding: '0 10px',
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
    minWidth: 0, // prevent overflow
  },

  dateSeparator: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    color: 'rgba(20,20,30,0.4)',
    flexShrink: 0,
  },

  // FIX 3: position:relative so icon can be placed inside
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  // FIX 3: icon absolutely positioned on left side
  searchIcon: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    color: 'rgba(20,20,30,0.4)',
    pointerEvents: 'none',
    zIndex: 1,
  },

  searchInput: {
    width: '100%',
    height: 46,
    padding: '0 14px 0 40px', // left padding for icon
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
  },

  activeFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1px solid rgba(20,20,30,0.07)',
    flexWrap: 'wrap',
  },

  activeFiltersLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    color: 'rgba(20,20,30,0.6)',
    whiteSpace: 'nowrap',
  },

  filterTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  filterTagRemove: {
    background: 'none',
    border: 'none',
    color: '#7C63FF',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    padding: 0,
    marginLeft: 4,
  },

  clearAllBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    padding: '6px 12px',
    borderRadius: 8,
    marginLeft: 'auto',
  },
};