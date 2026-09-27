import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Flame, Award, RefreshCw, Crown, Sparkles } from 'lucide-react';
import { fetchLeaderboardEntries } from '../lib/supabase';

export default function Leaderboard({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [isEventClosed, setIsEventClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadLeaderboard = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await fetchLeaderboardEntries();
      setLeaders(res.entries || []);
      setIsEventClosed(Boolean(res.isEventClosed));
    } catch (cause) {
      if (!isBackground) setError(cause.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const handleUpdate = () => loadLeaderboard(true);
    window.addEventListener('leaderboard-updated', handleUpdate);
    // Auto-refresh every 8 seconds for live audience
    const interval = setInterval(() => {
      loadLeaderboard(true);
    }, 8000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('leaderboard-updated', handleUpdate);
    };
  }, []);

  // Top 5 winners for closed event, or Top 20 for live leaderboard
  const displayLeaders = isEventClosed ? leaders.slice(0, 5) : leaders.slice(0, 20);

  // Helper for rank theme
  const getRankTheme = (rank) => {
    if (rank === 1) {
      return {
        cardBg: '#141414',
        cardBorder: '4px solid #ffea00',
        cardShadow: '8px 8px 0px #ffea00',
        rankBadgeBg: '#ffea00',
        rankBadgeColor: '#141414',
        nameColor: '#ffffff',
        scoreColor: '#ffea00',
        idBadgeBg: '#262626',
        idBadgeColor: '#ffea00',
        label: '1ST PLACE • GOLD CHAMPION',
        accent: '#ffea00'
      };
    }
    if (rank === 2) {
      return {
        cardBg: '#0f172a',
        cardBorder: '4px solid #38bdf8',
        cardShadow: '7px 7px 0px #38bdf8',
        rankBadgeBg: '#38bdf8',
        rankBadgeColor: '#0f172a',
        nameColor: '#ffffff',
        scoreColor: '#38bdf8',
        idBadgeBg: '#1e293b',
        idBadgeColor: '#7dd3fc',
        label: '2ND PLACE • SILVER RUNNER-UP',
        accent: '#38bdf8'
      };
    }
    if (rank === 3) {
      return {
        cardBg: '#1f1307',
        cardBorder: '4px solid #f59e0b',
        cardShadow: '6px 6px 0px #f59e0b',
        rankBadgeBg: '#f59e0b',
        rankBadgeColor: '#1c1917',
        nameColor: '#ffffff',
        scoreColor: '#fbbf24',
        idBadgeBg: '#292524',
        idBadgeColor: '#fde68a',
        label: '3RD PLACE • BRONZE',
        accent: '#f59e0b'
      };
    }
    if (rank === 4) {
      return {
        cardBg: '#062319',
        cardBorder: '4px solid #10b981',
        cardShadow: '6px 6px 0px #10b981',
        rankBadgeBg: '#10b981',
        rankBadgeColor: '#022c22',
        nameColor: '#ffffff',
        scoreColor: '#34d399',
        idBadgeBg: '#064e3b',
        idBadgeColor: '#a7f3d0',
        label: '4TH PLACE • EMERALD',
        accent: '#10b981'
      };
    }
    if (rank === 5) {
      return {
        cardBg: '#1c0d2b',
        cardBorder: '4px solid #a855f7',
        cardShadow: '6px 6px 0px #a855f7',
        rankBadgeBg: '#a855f7',
        rankBadgeColor: '#3b0764',
        nameColor: '#ffffff',
        scoreColor: '#c084fc',
        idBadgeBg: '#3b0764',
        idBadgeColor: '#e9d5ff',
        label: '5TH PLACE • AMETHYST',
        accent: '#a855f7'
      };
    }
    return {
      cardBg: '#ffffff',
      cardBorder: '3px solid #1a1a1a',
      cardShadow: '5px 5px 0px #1a1a1a',
      rankBadgeBg: '#1a1a1a',
      rankBadgeColor: '#ffffff',
      nameColor: '#111111',
      scoreColor: '#111111',
      idBadgeBg: '#f1f5f9',
      idBadgeColor: '#475569',
      label: '',
      accent: '#1a1a1a'
    };
  };

  return (
    <div className="flex-col h-full p-4 md:p-6" style={{ overflowY: 'auto', minHeight: 'calc(100vh - 72px)', background: 'var(--bg-color)', boxSizing: 'border-box' }}>
      {/* Top Controls Bar */}
      <div className="flex-center" style={{ justifyContent: onBack ? 'space-between' : 'flex-end', marginBottom: '1rem', width: '100%', maxWidth: '1050px', margin: '0 auto 1rem auto' }}>
        {onBack && (
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.95rem', background: '#fff' }} 
            onClick={onBack}
          >
            <ArrowLeft size={17} /> BACK
          </button>
        )}

        <button 
          className="btn btn-outline" 
          style={{ padding: '0.45rem 1.1rem', fontSize: '0.9rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }} 
          onClick={() => loadLeaderboard(false)}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> REFRESH
        </button>
      </div>

      <div className="flex-col flex-1 gap-5 w-full max-w-4xl mx-auto" style={{ paddingBottom: '2.5rem' }}>
        {/* EVENT CLOSED: 5 WINNERS ANNOUNCEMENT BANNER */}
        {isEventClosed ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-col flex-center text-center gap-2"
            style={{ padding: '1rem', background: '#111', border: '4px solid #ffea00', boxShadow: '8px 8px 0px #ffea00', color: '#fff', marginBottom: '0.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ffea00', color: '#111', padding: '0.3rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.12em' }}>
              <Crown size={16} /> COMPETITION OFFICIALLY CONCLUDED
            </div>
            <h1 className="title-massive" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', color: '#ffea00', letterSpacing: '0.02em', margin: '0.2rem 0' }}>
              THE 5 WINNERS
            </h1>
            <p style={{ color: '#d4d4d8', fontSize: '1.05rem', margin: 0, maxWidth: '600px', fontWeight: 500 }}>
              The Rapid Fire competition has closed! Congratulations to the top 5 science champions:
            </p>
          </motion.div>
        ) : (
          /* LIVE LEADERBOARD HEADER */
          <div className="flex-col flex-center text-center gap-2">
            <div className="flex-center gap-3">
              <Flame size={32} color="#e63946" />
              <h1 className="title-massive" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', letterSpacing: '0.02em', margin: 0 }}>
                LEADERBOARD
              </h1>
              <Flame size={32} color="#e63946" />
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: '#1a1a1a', 
              color: '#fff', 
              padding: '0.35rem 1.1rem', 
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}>
              <Trophy size={14} color="#ffea00" /> TOP SCIENCE CONTENDERS
            </div>
          </div>
        )}

        {loading || error || displayLeaders.length === 0 ? (
          <div 
            className="panel text-center flex-col flex-center gap-4" 
            style={{ marginTop: '1.5rem', padding: '3rem 2rem', background: '#fff' }}
          >
            <Trophy size={50} color="var(--gray)" />
            <h3 style={{ fontSize: '1.6rem', color: '#1a1a1a' }}>
              {loading ? 'FETCHING THE RESULTS…' : error ? 'LEADERBOARD UNAVAILABLE' : 'NO RECORDS REGISTERED YET'}
            </h3>
            <p style={{ color: 'var(--gray)', fontSize: '0.95rem', maxWidth: '340px' }}>
              {error || (loading ? 'Connecting to live database…' : 'Complete a 60-second quiz to establish the first record.')}
            </p>
          </div>
        ) : (
          <div className="flex-col gap-3" style={{ width: '100%' }}>
            <AnimatePresence>
              {displayLeaders.map((entry, index) => {
                const rank = index + 1;
                const theme = getRankTheme(rank);
                const isWinnerView = isEventClosed;

                return (
                  <motion.div
                    key={entry.id || `${entry.name}-${index}`}
                    initial={{ x: -25, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: theme.cardBg,
                      border: theme.cardBorder,
                      boxShadow: theme.cardShadow,
                      padding: isWinnerView ? '1.25rem 1.6rem' : (rank <= 5 ? '1rem 1.5rem' : '0.8rem 1.3rem'),
                      position: 'relative',
                      gap: '1.2rem',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Left: Rank Badge + Contender Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 0, flex: 1 }}>
                      {/* Rank Number Badge */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: rank === 1 ? '56px' : (rank <= 5 ? '48px' : '42px'),
                        height: rank === 1 ? '56px' : (rank <= 5 ? '48px' : '42px'),
                        background: theme.rankBadgeBg,
                        color: theme.rankBadgeColor,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: rank === 1 ? '1.7rem' : (rank <= 5 ? '1.4rem' : '1.2rem'),
                        border: rank <= 5 ? '2px solid rgba(255,255,255,0.2)' : '2px solid #1a1a1a',
                        boxShadow: rank <= 5 ? '3px 3px 0px rgba(0,0,0,0.4)' : 'none',
                        flexShrink: 0
                      }}>
                        {rank === 1 ? <Crown size={18} /> : rank <= 3 ? <Award size={16} /> : null}
                        <span>{rank < 10 ? `0${rank}` : rank}</span>
                      </div>

                      {/* Name & University ID */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: rank === 1 ? '1.85rem' : (rank <= 5 ? '1.55rem' : '1.3rem'),
                            fontWeight: 700,
                            color: theme.nameColor,
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            wordBreak: 'break-word'
                          }}>
                            {entry.name}
                          </span>

                          {theme.label && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '0.08em',
                              padding: '0.15rem 0.5rem',
                              background: theme.rankBadgeBg,
                              color: theme.rankBadgeColor,
                              border: '1px solid rgba(0,0,0,0.2)'
                            }}>
                              {theme.label}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: theme.idBadgeBg,
                            color: theme.idBadgeColor,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            border: rank <= 5 ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                            letterSpacing: '0.04em',
                            fontFamily: 'var(--font-body)'
                          }}>
                            ID: {entry.universityId || 'N/A'}
                          </span>

                          {entry.correct !== undefined && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: rank <= 5 ? 'rgba(255,255,255,0.6)' : '#64748b',
                              fontWeight: 500
                            }}>
                              {entry.correct}✓ / {entry.wrong || 0}✗
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      flexShrink: 0,
                      paddingLeft: '0.5rem'
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: rank === 1 ? '3.6rem' : (rank <= 5 ? '3rem' : '2.4rem'),
                        fontWeight: 700,
                        lineHeight: 0.9,
                        color: theme.scoreColor
                      }}>
                        {entry.score}
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: rank <= 5 ? 'rgba(255,255,255,0.5)' : '#64748b',
                        textTransform: 'uppercase',
                        marginTop: '0.2rem'
                      }}>
                        POINTS
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
