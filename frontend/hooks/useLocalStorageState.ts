import { useState, useEffect } from 'react';

export const useLocalStorageState = <T,>(key: string, defaultValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
        return defaultValue instanceof Function ? defaultValue() : defaultValue;
    }
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return defaultValue instanceof Function ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
    }
  }, [key, state]);

  return [state, setState];
};
