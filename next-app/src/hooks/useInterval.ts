import { useRef, useEffect } from "react";

const useInterval = (
  callback: () => void,
  delay: number,
  runningSignal?: boolean | undefined
) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function trigger() {
      if (
        savedCallback.current &&
        (runningSignal === true || runningSignal === undefined)
      ) {
        savedCallback.current();
      }
    }
    if (delay <= 0 || !runningSignal) {
      return;
    }
    let intervalInstance = setInterval(() => {
      trigger();
    }, delay);

    return () => {
      clearInterval(intervalInstance);
    };
  }, [delay,runningSignal]);
};

export default useInterval;
