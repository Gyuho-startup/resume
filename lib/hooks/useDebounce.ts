import { useEffect, useState } from 'react';

/**
 * Debounce hook for autosave functionality
 * Delays updating the value until after the specified delay
 */
export function useDebounce<T>(value: T, delay: number = 2000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
