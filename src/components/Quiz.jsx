import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import questionsData from '../data/questions.json';

export default function Quiz({ onTimeUp, onCancel }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, attempted: 0 });
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', x, y }

  const timerRef = useRef(null);
  const deadlineRef = useRef(0);
  const answerLockedRef = useRef(false);

  const shuffledQuestions = () => {
    const items = [...questionsData];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };

  // Shuffle questions on mount
  useEffect(() => {
    setQuestions(shuffledQuestions());
  }, []);

  useEffect(() => { answerLockedRef.current = false; }, [currentIndex, questions]);

  // Timer logic
  useEffect(() => {
    deadlineRef.current = Date.now() + 60000;
    timerRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    }, 100);

    return () => clearInterval(timerRef.current);
  }, []);

  // Time's up effect
  useEffect(() => {
    if (timeLeft === 0) {
      const finishTimeout = setTimeout(() => {
        onTimeUp({ score, ...stats });
      }, 1500); // give 1.5s for Time's up transition
      return () => clearTimeout(finishTimeout);
    }
  }, [timeLeft, onTimeUp, score, stats]);

  const cancel = () => {
    if (window.confirm('Leave this attempt? Your score will not be saved.')) {
      clearInterval(timerRef.current);
      onCancel();
    }
  };

  const handleAnswer = (index, e) => {
    if (answerLockedRef.current || Date.now() >= deadlineRef.current || timeLeft === 0) return;
    answerLockedRef.current = true;
    
    const isCorrect = index === questions[currentIndex].correctIndex;
    const rect = e.target.getBoundingClientRect();
    
    // Show feedback popup
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      id: Date.now(),
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    
    // Clear feedback quickly
    setTimeout(() => setFeedback(null), 400);

    if (isCorrect) {
      setScore((s) => s + 2);
      setStats((s) => ({ ...s, correct: s.correct + 1, attempted: s.attempted + 1 }));
    } else {
      setScore((s) => s - 1);
      setStats((s) => ({ ...s, wrong: s.wrong + 1, attempted: s.attempted + 1 }));
    }

    // Move to next question instantly
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or reshuffle if out of questions
      setQuestions(shuffledQuestions());
      setCurrentIndex(0);
    }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isTense = timeLeft <= 10 && timeLeft > 0;

  if (timeLeft === 0) {
    return (
      <div className="flex-col flex-center h-full bg-accent-red">
        <button className="quiz-cancel" onClick={cancel}>← CANCEL ATTEMPT</button>
        <motion.h1 
          className="title-massive text-white text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          TIME'S UP!
        </motion.h1>
      </div>
    );
  }

  return (
    <main className="rapid-quiz flex-col h-full p-4">
      <button className="quiz-cancel" onClick={cancel}>← CANCEL ATTEMPT</button>
      {/* Header Info */}
      <div className="rapid-quiz-header flex-center" style={{ justifyContent: 'space-between', padding: '1rem', borderBottom: '4px solid var(--text-color)' }}>
        <div className="flex-col">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>SCORE</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: '#fff' }}>{score}</span>
        </div>
        <div className="flex-col" style={{ alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>TIME</span>
          <div className={`timer-display ${isTense ? 'text-accent-red shake' : ''}`} style={{ lineHeight: 1 }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="rapid-question-area flex-col flex-1 mt-8 gap-8">
        <h2 style={{ fontSize: '2rem', fontWeight: 600, textAlign: 'center' }}>
          {currentQ.question}
        </h2>
        
        <div className="rapid-answers" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto', paddingBottom: '2rem' }}>
          {currentQ.options.map((opt, i) => (
            <button 
              key={i}
              className="btn panel rapid-answer"
              style={{ fontSize: '1.2rem', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none', fontWeight: 500 }}
              onClick={(e) => handleAnswer(i, e)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.id}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -50, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className={`score-popup ${feedback.type === 'correct' ? 'text-accent-blue' : 'text-accent-red'}`}
            style={{ left: feedback.x - 30, top: feedback.y - 50 }}
          >
            {feedback.type === 'correct' ? '+2' : '-1'}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
