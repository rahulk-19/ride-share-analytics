import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Ingestor } from './features/ingestor/Ingestor';
import { Dashboard } from './features/dashboard/Dashboard';
import type { TransportEvent } from '@shared/types';
import './App.css';

function App() {
  const [events, setEvents] = useState<TransportEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/analytics`);
      
      if (!res.ok) throw new Error('Network response error');
      
      const data = await res.json() as TransportEvent[];
      setEvents(data);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="container">
  
        <nav className="nav-bar">
          <Link to="/" className="nav-button">Add Event</Link>
          <Link to="/dashboard" className="nav-button">View Dashboard</Link>
        </nav>

        <Routes>

          <Route path="/" element={<Ingestor onEventSent={fetchEvents} />} />

          <Route path="/dashboard" element={<Dashboard events={events} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;