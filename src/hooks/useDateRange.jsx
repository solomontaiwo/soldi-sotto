import { useState, useMemo } from 'react';
import { getPeriodRange } from '../utils/statsUtils';

export const useDateRange = (initialPeriod = 'monthly', initialCustomRange = null) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [customRange, setCustomRange] = useState(initialCustomRange || { from: '', to: '' });

  const dateRange = useMemo(() => {
    return getPeriodRange(period, customRange);
  }, [period, customRange]);

  return {
    period,
    setPeriod,
    customRange,
    setCustomRange,
    startDate: dateRange.start,
    endDate: dateRange.end,
  };
};
