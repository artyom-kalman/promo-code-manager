import { useState, useCallback, useEffect } from 'react';
import { TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useAnalyticsQuery } from '../../hooks/useAnalyticsQuery';
import { fetchPromoUsageAnalytics } from '../../api/analytics';
import type {
  PromoUsageAnalyticsRow,
  PromoUsageAnalyticsParams,
} from '../../types/analytics';
import { AnalyticsTable } from './AnalyticsTable';

const columnHelper = createColumnHelper<PromoUsageAnalyticsRow>();

const SORT_FIELD_MAP: Record<string, string> = {
  userName: 'user_name',
  userEmail: 'user_email',
  promocodeCode: 'promocode_code',
  discountAmount: 'discount_amount',
  createdAt: 'created_at',
};

const columns = [
  columnHelper.accessor('userName', { header: 'User' }),
  columnHelper.accessor('userEmail', { header: 'Email' }),
  columnHelper.accessor('promocodeCode', { header: 'Promo Code' }),
  columnHelper.accessor('discountAmount', {
    header: 'Discount Amount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: (info) => dayjs(info.getValue()).format('YYYY-MM-DD HH:mm'),
  }),
];

export function PromoUsagesTable() {
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [debouncedUserName] = useDebouncedValue(userNameInput, 500);
  const [debouncedUserEmail] = useDebouncedValue(userEmailInput, 500);
  const [debouncedPromoCode] = useDebouncedValue(promoCodeInput, 500);

  const buildParams = useCallback(
    (base: {
      page: number;
      pageSize: number;
      sorting: { id: string; desc: boolean }[];
      filters: Record<string, string>;
      dateFrom: string;
      dateTo: string;
    }): PromoUsageAnalyticsParams => {
      const sort = base.sorting[0];
      return {
        page: base.page,
        pageSize: base.pageSize,
        sortBy: sort ? SORT_FIELD_MAP[sort.id] ?? sort.id : undefined,
        sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        dateFrom: base.dateFrom,
        dateTo: base.dateTo,
        userName: base.filters.userName || undefined,
        userEmail: base.filters.userEmail || undefined,
        promocodeCode: base.filters.promocodeCode || undefined,
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
    queryKey: 'analytics-promo-usages',
    fetchFn: fetchPromoUsageAnalytics,
    buildParams,
  });

  useEffect(() => { setFilter('userName', debouncedUserName); }, [debouncedUserName, setFilter]);
  useEffect(() => { setFilter('userEmail', debouncedUserEmail); }, [debouncedUserEmail, setFilter]);
  useEffect(() => { setFilter('promocodeCode', debouncedPromoCode); }, [debouncedPromoCode, setFilter]);

  const filterNodes = (
    <>
      <TextInput
        placeholder="Filter by user name"
        value={userNameInput}
        onChange={(e) => setUserNameInput(e.currentTarget.value)}
        size="xs"
        w={180}
      />
      <TextInput
        placeholder="Filter by email"
        value={userEmailInput}
        onChange={(e) => setUserEmailInput(e.currentTarget.value)}
        size="xs"
        w={200}
      />
      <TextInput
        placeholder="Filter by promo code"
        value={promoCodeInput}
        onChange={(e) => setPromoCodeInput(e.currentTarget.value)}
        size="xs"
        w={180}
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
