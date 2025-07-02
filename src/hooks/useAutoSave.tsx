import { useState, useEffect } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T,>({
  data,
  onSave,
  delay = 3000,
  enabled = true
}: UseAutoSaveOptions<T>) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        await onSave(data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, onSave, delay, enabled, hasUnsavedChanges]);

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [data]);

  const manualSave = async () => {
    try {
      setIsAutoSaving(true);
      await onSave(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    } finally {
      setIsAutoSaving(false);
    }
  };

  return {
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    manualSave
  };
};