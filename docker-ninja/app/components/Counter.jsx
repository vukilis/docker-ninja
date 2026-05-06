import React from 'react';

export const Counter = ({ value, delay = 0 }) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    // Check if the preloader has already finished in this session
    const isFirstLoad = !window.__dn_preloader_finished;
    const actualDelay = isFirstLoad ? delay : 100;

    let timer;
    const startTimeout = setTimeout(() => {
      window.__dn_preloader_finished = true;

      let start = 0;
      const end = parseInt(value);
      if (isNaN(end) || end <= 0) {
        setCount(value);
        return;
      }

      const totalMiliseconds = 800;
      const incrementTime = Math.max(totalMiliseconds / end, 10);

      timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) {
          clearInterval(timer);
        }
      }, incrementTime);
    }, actualDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [value, delay]);

  return <>{count}</>;
};