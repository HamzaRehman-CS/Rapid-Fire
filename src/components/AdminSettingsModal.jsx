import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Power, 
  ShieldAlert, 
  FileSpreadsheet, 
  RotateCcw, 
  AlertTriangle, 
  Trash2, 
  Search, 
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { 
  downloadAttemptsCsv, 
  closeEventSession, 
  reopenEventSession, 
  checkEventStatus,
  deleteAttemptByUniversityId,
  clearAllLeaderboardAttempts,
  searchAttempts
} from '../lib/supabase';

export default function AdminSettingsModal({ isOpen, onClose, onEndGame }) {
  // Event Status & CSV
  const [downloading, setDownloading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEventClosed, setIsEventClosed] = useState(false);

  // End Game state
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [endPassword, setEndPassword] = useState('');
  const [endError, setEndError] = useState('');

  // Delete specific attempt state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear all attempts state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearError, setClearError] = useState('');
  const [clearSuccess, setClearSuccess] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkEventStatus().then(setIsEventClosed);
      setDeleteSuccess('');
      setClearSuccess('');
      setSearchMsg('');
      setSearchResults([]);
      setTargetToDelete(null);
      setShowClearConfirm(false);
      setShowEndGameConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Download CSV
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

  // 2. Search attempts by university ID
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchMsg('');
    setTargetToDelete(null);
    setDeleteSuccess('');

    try {
      const results = await searchAttempts(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setSearchMsg(`No active attempts found matching "${searchQuery}".`);
      }
    } catch (err) {
      setSearchMsg('Error searching: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Confirm Delete Single Attempt
  const handleDeleteAttempt = async (e) => {
    e.preventDefault();
    setDeleteError('');
    if (deletePassword.trim().toLowerCase() !== 'register') {
      setDeleteError('Incorrect password. Access denied.');
      return;
    }

    if (!targetToDelete) return;
    setIsDeleting(true);

    try {
      await deleteAttemptByUniversityId(targetToDelete.university_id);
      setDeleteSuccess(`✓ Attempt for ${targetToDelete.name} (${targetToDelete.university_id}) was successfully deleted!`);
      setTargetToDelete(null);
      setDeletePassword('');
      // Refresh search
      const updated = searchResults.filter(r => r.university_id.toLowerCase() !== targetToDelete.university_id.toLowerCase());
      setSearchResults(updated);
    } catch (err) {
      setDeleteError('Failed to delete attempt: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Confirm Clear Entire Leaderboard
  const handleClearAllSubmit = async (e) => {
    e.preventDefault();
    setClearError('');
    if (clearPassword.trim().toLowerCase() !== 'register') {
      setClearError('Incorrect password. Access denied.');
      return;
    }

    setIsClearing(true);
    try {
      await clearAllLeaderboardAttempts();
      setClearSuccess('✓ Entire leaderboard has been cleared! All scores reset to zero.');
      setShowClearConfirm(false);
      setClearPassword('');
      setSearchResults([]);
    } catch (err) {
      setClearError('Failed to clear leaderboard: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  // 5. End Game Submit
  const handleEndGameSubmit = async (e) => {
    e.preventDefault();
    setEndError('');
    if (endPassword.trim().toLowerCase() !== 'register') {
      setEndError('Incorrect password. Access denied.');
      return;
    }

    setIsProcessing(true);
    try {
      await closeEventSession();
      setIsEventClosed(true);
      onEndGame();
    } catch (err) {
      setEndError('Failed to close event in database: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Reopen Event
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
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="panel"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '4px solid var(--text-color)',
          boxShadow: '10px 10px 0px var(--text-color)',
          padding: '1.4rem',
          position: 'relative'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--text-color)', paddingBottom: '0.65rem', marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={24} color="var(--accent-red)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: 0 }}>
              COORDINATOR DESK SETTINGS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.25rem 0.55rem', border: '2px solid var(--text-color)', background: '#fff' }}
          >
            <X size={19} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

          {/* Section 1: CSV Export */}
          <div style={{ padding: '0.9rem', background: '#f8fafc', border: '2px solid #cbd5e1' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
              Participant Database (Full CSV Export)
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.82rem', margin: '0 0 0.6rem 0' }}>
              Download an offline spreadsheet of all attempts, containing Participant Names, University IDs, Phone Numbers, Scores, and Timestamps.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={17} /> {downloading ? 'GENERATING CSV…' : 'DOWNLOAD ALL ATTEMPTS (CSV)'}
            </button>
          </div>

          {/* Section 2: Delete Specific Attempt (Search by University ID) */}
          <div style={{ padding: '0.95rem', background: '#fffbeb', border: '2px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.02rem', color: '#92400e', marginBottom: '0.25rem' }}>
              <Trash2 size={19} color="#d97706" /> Delete Attempt by University ID
            </div>
            <p style={{ color: '#78350f', fontSize: '0.82rem', margin: '0 0 0.65rem 0' }}>
              Search for a participant by University ID or Name to remove their attempt from the leaderboard. Requires coordinator password.
            </p>

            {deleteSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.55rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} /> {deleteSuccess}
              </div>
            )}

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter University ID (e.g. 21-SE-105)"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.9rem',
                  border: '2px solid #d97706',
                  borderRadius: '3px'
                }}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="btn btn-outline"
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.88rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Search size={15} /> {isSearching ? 'FINDING…' : 'SEARCH'}
              </button>
            </form>

            {searchMsg && (
              <div style={{ fontSize: '0.82rem', color: '#b45309', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                {searchMsg}
              </div>
            )}

            {/* Search Results List */}
            {searchResults.length > 0 && !targetToDelete && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', background: '#fff', border: '1px solid #fcd34d', padding: '0.5rem' }}>
                {searchResults.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: '#fef3c7', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.25 }}>
                      <strong style={{ textTransform: 'uppercase' }}>{item.name}</strong> • ID: <code>{item.university_id}</code>
                      <div style={{ color: '#78350f', fontSize: '0.78rem' }}>
                        Score: <strong>{item.score}</strong> | Correct: {item.correct} | Wrong: {item.wrong}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', background: '#ef4444', color: '#fff' }}
                      onClick={() => {
                        setTargetToDelete(item);
                        setDeleteError('');
                        setDeletePassword('');
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Delete Single Dialog */}
            {targetToDelete && (
              <form onSubmit={handleDeleteAttempt} style={{ background: '#fef2f2', border: '2px solid #ef4444', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 700 }}>
                  Confirm deletion for: {targetToDelete.name} ({targetToDelete.university_id}) • Score: {targetToDelete.score}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                  Enter coordinator password (<code>register</code>) to erase this participant's attempt:
                </div>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password (register)"
                  required
                  autoFocus
                  style={{ padding: '0.5rem', fontSize: '0.9rem', border: '2px solid #ef4444' }}
                />
                {deleteError && (
                  <div style={{ color: '#b91c1c', fontSize: '0.78rem', fontWeight: 600 }}>
                    {deleteError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', background: '#dc2626', color: '#fff' }}
                  >
                    {isDeleting ? 'DELETING…' : 'CONFIRM DELETE ATTEMPT'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', background: '#fff' }}
                    onClick={() => setTargetToDelete(null)}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 3: Clear Entire Leaderboard */}
          <div style={{ padding: '0.95rem', background: '#fef2f2', border: '2px solid #fca5a5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.02rem', color: '#991b1b', marginBottom: '0.25rem' }}>
              <AlertOctagon size={19} color="#dc2626" /> Clear Entire Leaderboard
            </div>
            <p style={{ color: '#7f1d1d', fontSize: '0.82rem', margin: '0 0 0.65rem 0' }}>
              Reset the entire leaderboard and wipe all recorded attempts back to zero. Requires coordinator authorization password.
            </p>

            {clearSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.55rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} /> {clearSuccess}
              </div>
            )}

            {!showClearConfirm ? (
              <button
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.65rem', background: '#fff', color: '#b91c1c', borderColor: '#b91c1c', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                onClick={() => {
                  setShowClearConfirm(true);
                  setClearError('');
                  setClearPassword('');
                }}
              >
                <Trash2 size={16} /> CLEAR ALL LEADERBOARD ATTEMPTS
              </button>
            ) : (
              <form onSubmit={handleClearAllSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '0.75rem', border: '2px solid #dc2626' }}>
                <div style={{ fontSize: '0.84rem', color: '#991b1b', fontWeight: 700 }}>
                  ⚠️ DANGER: This will erase all current records from the public leaderboard.
                </div>
                <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                  Enter coordinator password (<code>register</code>) to proceed:
                </div>
                <input
                  type="password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  placeholder="Enter password (register)"
                  required
                  autoFocus
                  style={{ padding: '0.5rem', fontSize: '0.9rem', border: '2px solid #dc2626' }}
                />
                {clearError && (
                  <div style={{ color: '#b91c1c', fontSize: '0.78rem', fontWeight: 600 }}>
                    {clearError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="submit"
                    disabled={isClearing}
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: '#dc2626', color: '#fff' }}
                  >
                    {isClearing ? 'CLEARING…' : 'YES, CLEAR ENTIRE LEADERBOARD'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', background: '#fff' }}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 4: End Game & Official Winners Announcement */}
          <div style={{ padding: '1rem', background: '#fff1f2', border: '2px solid #fecdd3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#9f1239', marginBottom: '0.3rem' }}>
              <ShieldAlert size={20} /> End Game & Publish Final Winners
            </div>

            {isEventClosed ? (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', padding: '0.65rem', border: '2px solid #ef4444', color: '#991b1b', fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={18} /> Event is currently marked as OFFICIALLY CLOSED. The public leaderboard is displaying the Top 5 Winners.
                </div>
                <button
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '0.65rem', background: '#fff', color: '#166534', borderColor: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
                  onClick={handleReopenEvent}
                >
                  <RotateCcw size={16} /> RE-OPEN / RESUME EVENT
                </button>
              </div>
            ) : !showEndGameConfirm ? (
              <div>
                <p style={{ color: '#881337', fontSize: '0.82rem', lineHeight: 1.4, margin: '0 0 0.7rem 0' }}>
                  Use this button to conclude the Rapid Fire event when all participants have played.
                </p>
                <button
                  className="btn btn-danger"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#e11d48',
                    color: '#fff',
                    border: '3px solid #1a1a1a',
                    boxShadow: '4px 4px 0px #1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
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

                <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#ffe4e6', border: '2px dashed #f43f5e', fontSize: '0.8rem', color: '#881337', lineHeight: 1.4 }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#9f1239' }}>
                    ℹ️ Important Instructions & Next Steps:
                  </strong>
                  • Pressing <strong>END GAME</strong> requires entering the coordinator password (<code>register</code>).<br />
                  • Once approved, the event will officially close and conclude.<br />
                  • <strong>The public leaderboard will automatically change to the Official Top 5 Winners page</strong> displaying the 5 winners with their Names, University IDs, and final scores for the entire audience.
                </div>
              </div>
            ) : (
              <form onSubmit={handleEndGameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.5rem' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '0.65rem', fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.4 }}>
                  Enter password <code>register</code> to confirm closing the event. The public leaderboard will immediately switch to the <strong>Top 5 Winners</strong> view.
                </div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9f1239' }}>
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
                    padding: '0.55rem',
                    fontSize: '0.95rem',
                    border: '2px solid #e11d48',
                    borderRadius: '3px'
                  }}
                />
                {endError && (
                  <div style={{ color: '#be123c', fontSize: '0.78rem', fontWeight: 600 }}>
                    {endError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.25rem' }}>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: '#e11d48',
                      color: '#fff',
                      border: '2px solid #1a1a1a',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {isProcessing ? 'CLOSING EVENT…' : 'CONFIRM & END GAME'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.6rem 0.9rem', background: '#fff', fontSize: '0.9rem' }}
                    onClick={() => setShowEndGameConfirm(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
