import { Settings } from 'lucide-react';

export default function BrandBar({ isAdmin, onOpenSettings }) {
  return (
    <header className="brand-bar" aria-label="Event organizers">
      {/* University Logo on the LEFT */}
      <div className="brand-mark brand-university">
        <img 
          src="/brand/university.png" 
          alt="PAF-IAST Skilling Pakistan" 
          style={{ height: '52px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Right side: Settings button (if admin) + Society Logo on the RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {isAdmin && onOpenSettings && (
          <button 
            className="btn btn-outline"
            style={{ 
              padding: '0.45rem 1rem', 
              fontSize: '0.9rem', 
              background: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              fontWeight: 700
            }}
            onClick={onOpenSettings}
            title="Coordinator Settings & CSV Export"
          >
            <Settings size={16} /> SETTINGS
          </button>
        )}
        <div className="brand-mark brand-society">
          <img 
            src="/brand/society.png" 
            alt="PAF-IAST Science Society" 
            style={{ height: '52px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
      </div>
    </header>
  );
}
