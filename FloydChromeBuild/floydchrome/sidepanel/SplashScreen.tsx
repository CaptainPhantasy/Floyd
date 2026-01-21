import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-container ${fade ? 'fade-out' : ''}`}>
      <img 
        src="../assets/branding.png" 
        alt="Floyd Chrome" 
        className="splash-logo"
      />
      <div className="splash-text">Floyd for Chrome</div>
    </div>
  );
};

export default SplashScreen;
