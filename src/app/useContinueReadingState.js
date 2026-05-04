import { useEffect, useState } from 'react';
import { clearContinueReading, getContinueReading } from '../lib/continueReading';

export default function useContinueReadingState() {
  const [continueRecord, setContinueRecord] = useState(null);

  useEffect(() => {
    setContinueRecord(getContinueReading());
  }, []);

  const clearContinueRecord = () => {
    clearContinueReading();
    setContinueRecord(null);
  };

  return { continueRecord, clearContinueRecord };
}
