import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function DashboardPage({ user, onUserChange }) {
  const navigate = useNavigate();
  const [bitchatStatus, setBitchatStatus] = useState({ connected: false, notes: 'Not configured' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBitChatStatus() {
      try {
        const response = await fetch(`${API_URL}/api/bitchat/status`, {
          credentials: 'include'
        });

        if (!response.ok) {
          setBitchatStatus({ connected: false, notes: 'Not configured' });
          return;
        }

        const data = await response.json();
        setBitchatStatus(data);
      } catch (error) {
        setBitchatStatus({ connected: false, notes: 'Not configured' });
      }
    }

    loadBitChatStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      onUserChange(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBitchatToggle = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bitchat/connect`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !bitchatStatus.connected })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'BitChat request failed');
      setBitchatStatus(data.status);
    } catch (error) {
      setBitchatStatus({ connected: false, notes: error.message || 'Unable to connect BitChat' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <div className="hexa-box dashboard-box">
        <div className="brand-row">
          <span className="brand-kicker">Hexa</span>
          <h1>Dashboard</h1>
        </div>

        <div className="user-card">
          <p className="user-name">{user.name || 'User'}</p>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="dashboard-stats">
          <div>
            <span>Account</span>
            <strong>Active</strong>
          </div>
          <div>
            <span>Provider</span>
            <strong>{user.provider || 'Local'}</strong>
          </div>
        </div>

        <div className="bitchat-panel">
          <div className="bitchat-header">
            <span>BitChat</span>
            <span className={`status-dot ${bitchatStatus.connected ? 'online' : 'offline'}`}></span>
          </div>

          <p>{bitchatStatus.notes}</p>

          <button className="secondary-button" onClick={handleBitchatToggle} disabled={loading}>
            {loading ? 'Working...' : bitchatStatus.connected ? 'Disable BitChat' : 'Enable BitChat'}
          </button>
        </div>

        <button className="primary-button danger" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </main>
  );
}
