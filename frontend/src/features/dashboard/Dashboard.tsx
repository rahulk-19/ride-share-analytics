import { useState } from 'react';
import { EventType } from '../../../../shared/types.ts';
import type { TransportEvent } from '../../../../shared/types.ts';

export function Dashboard({ events }: { events: TransportEvent[] }) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterText, setFilterText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<TransportEvent | null>(null);

  // --- Built-in Analytics ---
  const rideRequests = events.filter(e => e.type === EventType.RIDE_REQUESTED);
  
  const rideOffered = events.filter(e => e.type === EventType.DRIVER_AVAILABLE);

  const getPopularCity = (list: TransportEvent[]) => {
    const allCities = list.flatMap(e => [e.payload.from, e.payload.to]);
    const counts = allCities.reduce((acc: Record<string, number>, city) => {
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    const winner = Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A';
    return winner.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getPopularRoute = (list: TransportEvent[]) => {
    const counts = list.reduce((acc: Record<string, number>, e) => {
      const route = `${e.payload.from} ➔ ${e.payload.to}`;
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {});
    const winner = Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A';
    return winner.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // --- Custom Filter ---
  const filteredEvents = events.filter(e => {
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesText = !filterText || JSON.stringify(e.payload).toLowerCase().includes(filterText.toLowerCase());
    return matchesType && matchesText;
  });

  return (
    <div className="dashboard-wrapper">
      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total Ride Requests: </span>
          <span className="stat-value">{rideRequests.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Rides Offered: </span>
          <span className="stat-value">{rideOffered.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Most Popular City: </span>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{getPopularCity(events)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Most Popular Route: </span>
          <span className="stat-value" style={{ fontSize: '0.9rem' }}>{getPopularRoute(events)}</span>
        </div>
      </div>

      {/* Custom Query Builder */}
      <div className="card custom-query">
        <h3>Custom Analytics Builder</h3>
        <div className="query-controls">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Event Types</option>
            <option value={EventType.RIDE_REQUESTED}>Ride Requests Only</option>
            <option value={EventType.DRIVER_AVAILABLE}>Driver Availability Only</option>
          </select>
          <input 
            type="text" 
            placeholder="Search keywords..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        <div className="query-result">
          <div className="query-status-bar">
            <span>Results Found: <strong>{filteredEvents.length}</strong></span>
            {filterText && <span className="active-filter">Filtering by: "{filterText}"</span>}
          </div>

          <div className="event-mini-log">
            {filteredEvents.length > 0 ? (
              filteredEvents.slice(-10).reverse().map((e, i) => (
                <button key={i} className="mini-event-btn" onClick={() => setSelectedEvent(e)}>
                  <span className="event-tag">{e.type === EventType.RIDE_REQUESTED ? 'RIDE' : 'DRIVE'}</span>
                  <span>{e.payload.from} ➔ {e.payload.to}</span>
                  <span className="view-details">Inspect</span>
                </button>
              ))
            ) : (
              <p className="muted">No events match your criteria...</p>
            )}
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔍 Event Details</h3>
              <span className="timestamp">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
            </div>
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-key">Type:</span>
                <span className="detail-value">{selectedEvent.type.replace('_', ' ')}</span>
              </div>
              <hr />
              <h4>Payload Data</h4>
              {Object.entries(selectedEvent.payload).map(([key, value]) => (
                <div className="detail-row" key={key}>
                  <span className="detail-key">{key}:</span>
                  <span className="detail-value">{String(value)}</span>
                </div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}