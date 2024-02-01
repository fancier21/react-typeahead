import { useRef, useCallback, useEffect } from "react";

type Callback = (...args: any) => void;

const useDebounceCallback = <T extends Callback>(cb: T, delay: number) => {
  const timeoutRef = useRef<number | undefined>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        cb.apply(null, args);
      }, delay);
    },
    [cb, delay],
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export default useDebounceCallback;
