import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import dayjs from 'dayjs';

export type DatePreset = 'today' | '7days' | '30days' | 'custom';

interface DateRangeState {
  preset: DatePreset;
  dateFrom: Date;
  dateTo: Date;
}

interface DateRangeContextValue extends DateRangeState {
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: Date, to: Date) => void;
}

function computeDates(preset: Exclude<DatePreset, 'custom'>): {
  dateFrom: Date;
  dateTo: Date;
} {
  const dateTo = dayjs().endOf('day').toDate();
  switch (preset) {
    case 'today':
      return { dateFrom: dayjs().startOf('day').toDate(), dateTo };
    case '7days':
      return { dateFrom: dayjs().subtract(6, 'day').startOf('day').toDate(), dateTo };
    case '30days':
      return { dateFrom: dayjs().subtract(29, 'day').startOf('day').toDate(), dateTo };
  }
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DateRangeState>(() => ({
    preset: '30days',
    ...computeDates('30days'),
  }));

  const setPreset = useCallback((preset: DatePreset) => {
    if (preset === 'custom') {
      setState((prev) => ({ ...prev, preset: 'custom' }));
    } else {
      setState({ preset, ...computeDates(preset) });
    }
  }, []);

  const setCustomRange = useCallback((from: Date, to: Date) => {
    setState({ preset: 'custom', dateFrom: from, dateTo: to });
  }, []);

  const value = useMemo(
    () => ({ ...state, setPreset, setCustomRange }),
    [state, setPreset, setCustomRange],
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDateRange(): DateRangeContextValue {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
