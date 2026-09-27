import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Power, ShieldAlert, FileSpreadsheet, RotateCcw, AlertTriangle } from 'lucide-react';
import { downloadAttemptsCsv, closeEventSession, reopenEventSession, checkEventStatus } from '../lib/supabase';

export default function AdminSettingsModal({ isOpen, onClose, onEndGame }) {
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [endPassword, setEndPassword] = useState('');
  const [endError, setEndError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEventClosed, setIsEventClosed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkEventStatus().then(setIsEventClosed);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAttemptsCsv();
    } catch (err) {
      alert('Error downloading CSV: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleEndGameSubmit = async (e) => {
    e.preventDefault();
    setEndError('');
    if (endPassword.trim().toLowerCase() !== 'register') {
      setEndError('Incorrect password. Access denied.');
      return;
    }

    setIsProcessing(true);
    try {
      // Mark event as closed in database
      await closeEventSession();
      setIsEventClosed(true);
      onEndGame();
    } catch (err) {
      setEndError('Failed to close event in database: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopenEvent = async () => {
    const entered = window.prompt("Enter coordinator password to RE-OPEN the event ('register'):");
    if (!entered || entered.trim().toLowerCase() !== 'register') {
      alert('Incorrect password. Action cancelled.');
      return;
    }

    try {
      await reopenEventSession();
      setIsEventClosed(false);
      alert('Event has been reopened! The public leaderboard is now back to live tracking.');
    } catch (err) {
      alert('Failed to reopen event: ' + err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#ffffff',
          border: '4px solid var(--text-color)',
          boxShadow: '10px 10px 0px var(--text-color)',
          padding: '1.5rem',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--text-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={24} color="var(--accent-red)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>
              COORDINATOR SETTINGS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.6rem', border: '2px solid var(--text-color)', background: '#fff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action 1: Export CSV */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', border: '2px solid #cbd5e1' }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
            Participant Database (Full CSV Export)
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
            Download an offline spreadsheet of all attempts up to the end, containing Participant Names, University IDs, Phone Numbers, Scores, and Timestamps.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={18} /> {downloading ? 'GENERATING CSV…' : 'DOWNLOAD ALL ATTEMPTS (CSV)'}
          </button>
        </div>

        {/* Action 2: End Game & Official Winners Announcement */}
        <div style={{ padding: '1.1rem', background: '#fff1f2', border: '2px solid #fecdd3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#9f1239', marginBottom: '0.3rem' }}>
            <ShieldAlert size={20} /> End Game & Publish Final Winners
          </div>

          {isEventClosed ? (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', padding: '0.6rem', border: '2px solid #ef4444', color: '#991b1b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} /> Event is currently marked as OFFICIALLY CLOSED. The public leaderboard is displaying the Top 5 Winners.
              </div>
              <button
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.65rem', background: '#fff', color: '#166534', borderColor: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleReopenEvent}
              >
                <RotateCcw size={16} /> RE-OPEN / RESUME EVENT
              </button>
            </div>
          ) : !showEndGameConfirm ? (
            <div>
              <p style={{ color: '#881337', fontSize: '0.88rem', lineHeight: 1.4, margin: '0 0 0.8rem 0' }}>
                Use this button to conclude the Rapid Fire event when all participants have played.
              </p>
              <button
                className="btn btn-danger"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#e11d48',
                  color: '#fff',
                  border: '3px solid #1a1a1a',
                  boxShadow: '4px 4px 0px #1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '1.05rem',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowEndGameConfirm(true);
                  setEndError('');
                  setEndPassword('');
                }}
              >
                <Power size={18} /> END GAME
              </button>

              <div style={{ marginTop: '0.8rem', padding: '0.75rem 0.9rem', background: '#ffe4e6', border: '2px dashed #f43f5e', fontSize: '0.82rem', color: '#881337', lineHeight: 1.45 }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#9f1239' }}>
                  ℹ️ Important Instructions & Next Steps:
                </strong>
                • Pressing <strong>END GAME</strong> requires entering the coordinator password (<code>register</code>).<br />
                • Once approved, the event will officially close and conclude.<br />
                • <strong>The public leaderboard will automatically change to the Official Top 5 Winners page</strong> displaying the 5 winners with their Names, University IDs, and final scores for the entire audience.
              </div>
            </div>
          ) : (
            <form onSubmit={handleEndGameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '0.65rem', fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.4 }}>
                Enter password <code>register</code> to confirm closing the event. The public leaderboard will immediately switch to the <strong>Top 5 Winners</strong> view.
              </div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239' }}>
                Coordinator Password (register) *
              </label>
              <input
                type="password"
                value={endPassword}
                onChange={(e) => setEndPassword(e.target.value)}
                placeholder="Enter password (register)"
                required
                autoFocus
                style={{
                  padding: '0.6rem',
                  fontSize: '1rem',
                  border: '2px solid #e11d48',
                  borderRadius: '3px'
                }}
              />
              {endError && (
                <div style={{ color: '#be123c', fontSize: '0.8rem', fontWeight: 600 }}>
                  {endError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: '#e11d48',
                    color: '#fff',
                    border: '2px solid #1a1a1a',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isProcessing ? 'CLOSING EVENT…' : 'CONFIRM & END GAME'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.65rem 1rem', background: '#fff' }}
                  onClick={() => setShowEndGameConfirm(false)}
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
