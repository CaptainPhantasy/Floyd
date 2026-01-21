import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img 
          src="/branding.png" 
          alt="Floyd Desktop" 
          className="splash-logo"
        />
        <h1 className="splash-title">Floyd Desktop</h1>
        <p className="splash-subtitle">AI-Powered Development</p>
      </div>
    </div>
  );
};

export { SplashScreen };
