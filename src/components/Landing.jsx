import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function Landing({ onStart }) {
  return (
    <main className="rapid-landing">
      <div className="rapid-marquee" aria-hidden="true">
        <span>THINK FAST</span><span>•</span>
        <span>ANSWER FASTER</span><span>•</span>
        <span>THINK FAST</span><span>•</span>
        <span>ANSWER FASTER</span><span>•</span>
        <span>THINK FAST</span><span>•</span>
        <span>ANSWER FASTER</span>
      </div>

      <motion.section 
        className="rapid-hero" 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rapid-hero-copy">
          <p className="rapid-eyebrow">
            <Zap size={16} fill="currentColor" /> THE SCIENCE FESTA SPEED ROUND
          </p>
          <h1>RAPID <em>FIRE.</em></h1>
          <p className="rapid-tagline">
            One minute. A brain full of science. Absolutely no time to overthink it.
          </p>
          <div className="rapid-hero-actions">
            <button className="btn btn-primary" onClick={onStart} style={{ padding: '0.9rem 2rem' }}>
              ENTER THE HOT SEAT <ArrowRight size={22} />
            </button>
          </div>
        </div>

        <div className="rapid-clock-art" aria-hidden="true">
          <div className="rapid-rays" />
          <div className="rapid-clock">
            <span>60</span>
            <small>SECONDS</small>
          </div>
          <b className="rapid-sticker">GO WITH<br />YOUR GUT!</b>
        </div>
      </motion.section>

      <div className="rapid-rules">
        <div>
          <strong>+2</strong>
          <span>FOR A RIGHT ANSWER</span>
        </div>
        <div>
          <strong>−1</strong>
          <span>FOR A WRONG ONE</span>
        </div>
        <div>
          <strong>∞</strong>
          <span>QUESTIONS UNTIL TIME’S UP</span>
        </div>
      </div>
    </main>
  );
}
