import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, KeyRound } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanId = adminId.trim().toUpperCase();
    const cleanPass = password.trim().toLowerCase();

    // ID: PAFSS26 (also allow BAFSS26), Password: register
    if ((cleanId === 'PAFSS26' || cleanId === 'BAFSS26') && cleanPass === 'register') {
      sessionStorage.setItem('rapid_fire_admin_auth', 'true');
      sessionStorage.setItem('rapid_fire_admin_id', cleanId);
      onLoginSuccess();
    } else {
      setError('Invalid Coordinator ID or Password. Please verify credentials.');
    }
  };

  return (
    <div className="flex-col h-full p-4 flex-center" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <button 
        className="btn btn-outline" 
        style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', marginBottom: '1.5rem', background: '#fff' }} 
        onClick={onCancel}
      >
        <ArrowLeft size={18} /> BACK TO LEADERBOARD
      </button>

      <motion.div 
        className="panel flex-col w-full max-w-md gap-6 p-6 md:p-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#fff', border: '4px solid var(--text-color)', boxShadow: '8px 8px 0px var(--text-color)' }}
      >
        <div className="flex-col flex-center text-center gap-2">
          <div style={{
            background: 'var(--accent-red)',
            color: '#fff',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            boxShadow: '3px 3px 0px var(--text-color)'
          }}>
            <Shield size={32} />
          </div>
          <h2 className="title-massive" style={{ fontSize: '2rem', margin: '0.5rem 0 0 0' }}>COORDINATOR ACCESS</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.95rem', margin: 0 }}>
            Restricted Game Station • Authorized Science Festa Personnel Only
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            color: '#991b1b',
            padding: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex-col gap-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em' }}>
              COORDINATOR ID *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="e.g. PAFSS26"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '1.1rem',
                  border: '3px solid var(--text-color)',
                  fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          <div className="flex-col gap-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em' }}>
              PASSWORD *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '1.1rem',
                border: '3px solid var(--text-color)',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            style={{ padding: '0.9rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <KeyRound size={20} /> UNLOCK GAME STATION
          </button>
        </form>
      </motion.div>
    </div>
  );
}
