import React from 'react';

export const Counter = ({ value, delay = 0 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const isFirstLoad = !window.__dn_preloader_finished;
    const actualDelay = isFirstLoad ? delay : 100;

    let timer;
    const startTimeout = setTimeout(() => {
      window.__dn_preloader_finished = true;

      const end = parseInt(value);
      if (isNaN(end) || end <= 0) {
        setCount(value);
        return;
      }

      // --- DYNAMIC DURATION LOGIC ---
      // Small numbers (Slower)
      // Large numbers (Faster)
      // const duration = end > 10000 ? 800 : 2000; 
      const duration = Math.max(600, 2000 - Math.log10(end) * 300);
      
      const frameRate = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameRate);
      let frame = 0;

      timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        
        // Ease-out makes it feel polished (starts fast, ends slow)
        const easeOut = 1 - Math.pow(1 - progress, 3); 
        const currentCount = Math.round(easeOut * end);

        setCount(currentCount);

        if (frame >= totalFrames) {
          setCount(end);
          clearInterval(timer);
        }
      }, frameRate);
    }, actualDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [value, delay]);

  return <>{count.toLocaleString()}</>;
};