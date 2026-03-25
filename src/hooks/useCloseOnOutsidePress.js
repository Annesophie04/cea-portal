import { useEffect } from 'react';

/**
 * Ferme au clic extérieur à deux refs (ex. panneau + bouton lanceur).
 * @param {boolean} enabled
 * @param {() => void} onClose
 * @param {React.RefObject<HTMLElement | null>} containerRef
 * @param {React.RefObject<HTMLElement | null>} ignoreRef
 */
export function useCloseOnOutsidePress(enabled, onClose, containerRef, ignoreRef) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerDown = (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (containerRef.current?.contains(t)) return;
      if (ignoreRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [enabled, onClose, containerRef, ignoreRef]);
}
