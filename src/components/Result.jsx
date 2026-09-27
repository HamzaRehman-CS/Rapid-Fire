import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { saveAttemptRecord } from '../lib/supabase';

export default function Result({ stats, player, attemptId, onNext }) {
  const hasSaved = useRef(false);
  const [saveStatus, setSaveStatus] = useState('saving');
  const [saveError, setSaveError] = useState('');

  const save = async () => {
    setSaveStatus('saving');
    setSaveError('');
    try {
      await saveAttemptRecord({
        attemptId,
        name: player.name,
        universityId: player.universityId,
        number: player.number,
        score: stats.score,
        correct: stats.correct,
        wrong: stats.wrong,
        attempted: stats.attempted
      });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      setSaveError(error.message || 'Could not record attempt.');
    }
  };
  
  useEffect(() => {
    if (!hasSaved.current && attemptId && stats && player?.name?.trim() && player?.universityId?.trim()) {
      hasSaved.current = true;
      save();
    }
  }, [attemptId, stats, player]);

  if (!stats || !player) return null;

  return (
    <div className="flex-col flex-center h-full p-4" style={{ height: 'calc(100vh - 75px)', overflow: 'hidden', justifyContent: 'center', gap: '1.25rem', width: '100%', maxWidth: '640px', margin: '0 auto', boxSizing: 'border-box' }}>
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray)', letterSpacing: '0.1em' }}>TIME'S UP • FINISHED</h2>
        <h1 className="title-massive text-accent-red" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', wordBreak: 'break-word', margin: '0.2rem 0 0 0' }}>
          {player.name}
        </h1>
      </motion.div>

      <motion.div 
        className="panel flex-col w-full text-center gap-2"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ padding: '1.5rem', background: '#fff' }}
      >
        <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: 'var(--gray)', letterSpacing: '0.08em' }}>
          FINAL SCORE
        </div>
        <div style={{ fontSize: 'clamp(4.5rem, 9vw, 6rem)', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 0.9 }}>
          {stats.score}
        </div>
        
        <div className="flex-center gap-6 mt-3" style={{ fontSize: '1.1rem' }}>
          <div className="flex-col">
            <span className="text-accent-blue font-bold" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{stats.correct}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 600 }}>CORRECT (+2)</span>
          </div>
          <div className="flex-col">
            <span className="text-accent-red font-bold" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{stats.wrong}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 600 }}>WRONG (−1)</span>
          </div>
          <div className="flex-col">
            <span className="font-bold" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{stats.attempted}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 600 }}>ATTEMPTED</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="flex-col w-full gap-3 mt-1"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className={`save-status ${saveStatus}`} role="status" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
          {saveStatus === 'saved' ? '✓ Saved to the live Supabase leaderboard!' : saveStatus === 'saving' ? 'Recording this attempt…' : saveError}
        </p>
        {saveStatus === 'error' && <button className="btn btn-outline" onClick={save}>RETRY SAVE</button>}
        
        <button 
          className="btn btn-primary" 
          onClick={onNext} 
          style={{ padding: '0.85rem', fontSize: '1.15rem', justifyContent: 'center' }}
        >
          NEXT PARTICIPANT <ArrowRight size={22} />
        </button>
      </motion.div>
    </div>
  );
}
