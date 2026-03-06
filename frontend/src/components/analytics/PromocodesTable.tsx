import { useState, useCallback, useEffect } from 'react';
import { Badge, TextInput, Select, NumberInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useAnalyticsQuery } from '../../hooks/useAnalyticsQuery';
import { fetchPromocodeAnalytics } from '../../api/analytics';
import type {
  PromocodeAnalyticsRow,
  PromocodeAnalyticsParams,
} from '../../types/analytics';
import { AnalyticsTable } from './AnalyticsTable';

const columnHelper = createColumnHelper<PromocodeAnalyticsRow>();

const SORT_FIELD_MAP: Record<string, string> = {
  code: 'code',
  discountPercent: 'discount_percent',
  maxUsages: 'max_usages',
  isActive: 'is_active',
  createdAt: 'created_at',
  totalUsages: 'total_usages',
  uniqueUsers: 'unique_users',
  totalRevenue: 'total_revenue',
  totalDiscountGiven: 'total_discount_given',
};

const columns = [
  columnHelper.accessor('code', { header: 'Code' }),
  columnHelper.accessor('discountPercent', {
    header: 'Discount%',
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor('maxUsages', { header: 'Max Usages' }),
  columnHelper.accessor('isActive', {
    header: 'Active',
    cell: (info) => (
      <Badge color={info.getValue() ? 'green' : 'red'}>
        {info.getValue() ? 'Yes' : 'No'}
      </Badge>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: (info) => dayjs(info.getValue()).format('YYYY-MM-DD'),
  }),
  columnHelper.accessor('totalUsages', { header: 'Total Usages' }),
  columnHelper.accessor('uniqueUsers', { header: 'Unique Users' }),
  columnHelper.accessor('totalRevenue', {
    header: 'Revenue',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('totalDiscountGiven', {
    header: 'Discount Given',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
];

export function PromocodesTable() {
  const [codeInput, setCodeInput] = useState('');
  const [debouncedCode] = useDebouncedValue(codeInput, 500);
  const [discountMin, setDiscountMin] = useState<number | string>('');
  const [discountMax, setDiscountMax] = useState<number | string>('');
  const [debouncedMin] = useDebouncedValue(discountMin, 500);
  const [debouncedMax] = useDebouncedValue(discountMax, 500);

  const buildParams = useCallback(
    (base: {
      page: number;
      pageSize: number;
      sorting: { id: string; desc: boolean }[];
      filters: Record<string, string>;
      dateFrom: string;
      dateTo: string;
    }): PromocodeAnalyticsParams => {
      const sort = base.sorting[0];
      return {
        page: base.page,
        pageSize: base.pageSize,
        sortBy: sort ? SORT_FIELD_MAP[sort.id] ?? sort.id : undefined,
        sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        dateFrom: base.dateFrom,
        dateTo: base.dateTo,
        code: base.filters.code || undefined,
        isActive: base.filters.isActive || undefined,
        discountPercentMin:
          base.filters.discountPercentMin
            ? Number(base.filters.discountPercentMin)
            : undefined,
        discountPercentMax:
          base.filters.discountPercentMax
            ? Number(base.filters.discountPercentMax)
            : undefined,
      };
    },
    [],
  );

  const {
    data,
    total,
    page,
    pageSize,
    totalPages,
    sorting,
    isLoading,
    isFetching,
    setPage,
    setPageSize,
    setSorting,
    setFilter,
  } = useAnalyticsQuery({
    queryKey: 'analytics-promocodes',
    fetchFn: fetchPromocodeAnalytics,
    buildParams,
  });

  useEffect(() => { setFilter('code', debouncedCode); }, [debouncedCode, setFilter]);
  useEffect(() => {
    setFilter('discountPercentMin', debouncedMin === '' ? '' : String(debouncedMin));
  }, [debouncedMin, setFilter]);
  useEffect(() => {
    setFilter('discountPercentMax', debouncedMax === '' ? '' : String(debouncedMax));
  }, [debouncedMax, setFilter]);

  const filterNodes = (
    <>
      <TextInput
        placeholder="Filter by code"
        value={codeInput}
        onChange={(e) => setCodeInput(e.currentTarget.value)}
        size="xs"
        w={160}
      />
      <Select
        placeholder="Active"
        value={null}
        onChange={(val) => setFilter('isActive', val ?? '')}
        data={[
          { value: '', label: 'All' },
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ]}
        size="xs"
        w={120}
        clearable
      />
      <NumberInput
        placeholder="Min discount%"
        value={discountMin}
        onChange={setDiscountMin}
        size="xs"
        w={130}
        min={0}
        max={100}
      />
      <NumberInput
        placeholder="Max discount%"
        value={discountMax}
        onChange={setDiscountMax}
        size="xs"
        w={130}
        min={0}
        max={100}
      />
    </>
  );

  return (
    <AnalyticsTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      sorting={sorting}
      isLoading={isLoading}
      isFetching={isFetching}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onSortingChange={setSorting}
      filters={filterNodes}
    />
  );
}
