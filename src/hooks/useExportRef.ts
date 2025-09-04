import { useRef, useCallback } from 'react';

// Hook to manage element references for export functionality
export const useExportRef = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const getExportElement = useCallback(() => {
    return elementRef.current;
  }, []);

  return {
    elementRef,
    getExportElement
  };
};