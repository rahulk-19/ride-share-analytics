import { useState } from 'react';
import { EventType } from '../../../../shared/types.ts';

interface IngestorProps {
  onEventSent: () => void; 
}

export function Ingestor({ onEventSent }: IngestorProps) {
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [formData, setFormData] = useState({ from: '', to: '', count: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async () => {
    const fromClean = formData.from.trim();
    const toClean = formData.to.trim();

    if (!fromClean || !toClean) {
      setFeedback({ type: 'error', message: 'Both From and To locations are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const event = {
      type: role === 'rider' ? EventType.RIDE_REQUESTED : EventType.DRIVER_AVAILABLE,
      payload: role === 'rider' 
        ? { from: fromClean.toLowerCase(), to: toClean.toLowerCase(), passengers: formData.count }
        : { from: fromClean.toLowerCase(), to: toClean.toLowerCase(), capacity: formData.count },
      timestamp: Date.now()
    };

    try {
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Event Successfully Created!' });
        setFormData({ from: '', to: '', count: 1 });
        onEventSent();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Connection failed. Please check your backend.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>RideShare Ingestor</h2>
        <p className="subtitle">Stream data into the analytics pipeline</p>
      </div>
      
      <div className="ingestor-form-grid">
        <div className="form-group">
          <label>Identify As</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="rider">Rider (Need a lift)</option>
            <option value="driver">Driver (Offering a ride)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Origin</label>
          <input 
            type="text" 
            placeholder="e.g. college park" 
            value={formData.from}
            onChange={e => setFormData({...formData, from: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input 
            type="text" 
            placeholder="e.g. washington dc" 
            value={formData.to}
            onChange={e => setFormData({...formData, to: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>{role === 'rider' ? 'Passengers' : 'Capacity'}</label>
          <input 
            type="number" 
            min="1"
            value={formData.count}
            onChange={e => setFormData({...formData, count: parseInt(e.target.value) || 1})} 
          />
        </div>
      </div>

      {feedback && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className={`ingestor-submit-btn ${isSubmitting ? 'btn-loading' : ''}`}
      >
        {isSubmitting ? 'Streaming to Kafka...' : 'Publish Event'}
      </button>
    </div>
  );
}