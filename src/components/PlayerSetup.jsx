import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';

export default function PlayerSetup({ onReady, onBack }) {
  const [name, setName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [number, setNumber] = useState('');
  const [countdown, setCountdown] = useState(null);

  const handleStart = () => {
    if (!name.trim() || !universityId.trim() || !number.trim()) return;
    setCountdown(3);
    
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown('GO!');
      } else {
        clearInterval(interval);
        onReady({ 
          name: name.trim(), 
          universityId: universityId.trim(),
          number: number.trim()
        });
      }
    }, 1000);
  };

  if (countdown !== null) {
    return (
      <div className="flex-col flex-center h-full" style={{ height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          className="title-massive text-accent-red"
          style={{ fontSize: '7rem' }}
        >
          {countdown}
        </motion.div>
      </div>
    );
  }

  const isFormValid = name.trim() && universityId.trim() && number.trim();

  return (
    <div className="flex-col h-full p-4" style={{ height: 'calc(100vh - 75px)', overflow: 'hidden', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <button 
        className="btn btn-outline" 
        style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', background: '#fff' }} 
        onClick={onBack}
      >
        <ArrowLeft size={18} /> BACK
      </button>

      <div className="flex-col gap-4 w-full max-w-xl mx-auto" style={{ margin: 'auto' }}>
        <h2 className="title-massive" style={{ fontSize: '2.4rem', textAlign: 'center', margin: 0 }}>
          PARTICIPANT SETUP
        </h2>
        
        <div className="panel flex-col w-full gap-3" style={{ padding: '1.5rem', background: '#fff' }}>
          <div className="flex-col gap-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
              PARTICIPANT NAME *
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Ali Ahmed" 
              style={{ padding: '0.75rem', fontSize: '1.1rem', border: '3px solid var(--text-color)', fontFamily: 'var(--font-body)' }} 
            />
          </div>
          <div className="flex-col gap-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
              UNIVERSITY ID *
            </label>
            <input 
              type="text" 
              value={universityId} 
              onChange={(e) => setUniversityId(e.target.value)} 
              placeholder="e.g. 21-SE-105" 
              style={{ padding: '0.75rem', fontSize: '1.1rem', border: '3px solid var(--text-color)', fontFamily: 'var(--font-body)' }} 
            />
          </div>
          <div className="flex-col gap-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
              PHONE NUMBER *
            </label>
            <input 
              type="tel" 
              value={number} 
              onChange={(e) => setNumber(e.target.value)} 
              placeholder="e.g. 03001234567" 
              style={{ padding: '0.75rem', fontSize: '1.1rem', border: '3px solid var(--text-color)', fontFamily: 'var(--font-body)' }} 
            />
          </div>
        </div>

        <button 
          className="btn btn-primary w-full" 
          onClick={handleStart}
          disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5, padding: '0.9rem', fontSize: '1.2rem', justifyContent: 'center' }}
        >
          READY? START SPEED ROUND <Play size={22} fill="currentColor" />
        </button>
      </div>

      <div style={{ height: '20px' }} />
    </div>
  );
}
