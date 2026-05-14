import React from 'react';

// Helper function for compact format
const formatCompactNumber = (number) => {
  if (number < 1000) return number;
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
};

export const Counter = ({ value, delay = 0 }) => {
  const [count, setCount] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

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

      const duration = 2000;
      const frameRate = 1000 / 60; 
      const totalFrames = Math.round(duration / frameRate);
      let frame = 0;

      timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOut = 1 - Math.pow(1 - progress, 3); 
        const currentCount = Math.round(easeOut * end);

        setCount(currentCount);

        if (frame >= totalFrames) {
          setCount(end);
          setIsFinished(true);
          clearInterval(timer);
        }
      }, frameRate);
    }, actualDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [value, delay]);

  return (
    <>
      {isFinished 
        ? formatCompactNumber(count)
        : count.toLocaleString()
      }
    </>
  );
};