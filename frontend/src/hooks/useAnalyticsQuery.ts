import { useState, useMemo, useCallback } from 'react';
import {
  useQuery,
  keepPreviousData,
  type QueryKey,
} from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useDateRange } from '../context/DateRangeContext';
import type { AnalyticsQueryParams, PaginatedResponse } from '../types/analytics';

interface UseAnalyticsQueryOptions<TRow, TParams extends AnalyticsQueryParams> {
  queryKey: string;
  fetchFn: (params: TParams) => Promise<PaginatedResponse<TRow>>;
  buildParams: (base: {
    page: number;
    pageSize: number;
    sorting: SortingState;
    filters: Record<string, string>;
    dateFrom: string;
    dateTo: string;
  }) => TParams;
  defaultPageSize?: number;
}

export function useAnalyticsQuery<TRow, TParams extends AnalyticsQueryParams>({
  queryKey,
  fetchFn,
  buildParams,
  defaultPageSize = 10,
}: UseAnalyticsQueryOptions<TRow, TParams>) {
  const { dateFrom, dateTo } = useDateRange();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const dateFromStr = dayjs(dateFrom).format('YYYY-MM-DD');
  const dateToStr = dayjs(dateTo).format('YYYY-MM-DD');

  // Reset page when date range changes (state-based derived state pattern)
  const [prevDates, setPrevDates] = useState({ dateFromStr, dateToStr });
  if (prevDates.dateFromStr !== dateFromStr || prevDates.dateToStr !== dateToStr) {
    setPrevDates({ dateFromStr, dateToStr });
    setPage(1);
  }

  const params = useMemo(
    () =>
      buildParams({
        page,
        pageSize,
        sorting,
        filters,
        dateFrom: dateFromStr,
        dateTo: dateToStr,
      }),
    [buildParams, page, pageSize, sorting, filters, dateFromStr, dateToStr],
  );

  const fullQueryKey: QueryKey = [
    queryKey,
    page,
    pageSize,
    sorting,
    filters,
    dateFromStr,
    dateToStr,
  ];

  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => fetchFn(params),
    placeholderData: keepPreviousData,
  });

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev;
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1);
  }, []);

  const totalPages = query.data ? Math.ceil(query.data.total / pageSize) : 0;

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    pageSize,
    totalPages,
    sorting,
    filters,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    setSorting,
    setFilter,
  };
}
