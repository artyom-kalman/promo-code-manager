import { useState, useCallback, useEffect, useMemo } from 'react';
import { Badge, TextInput, Select, SimpleGrid } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import { IconUsers, IconCash, IconDiscount, IconTicket } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useAnalyticsQuery } from '../../hooks/useAnalyticsQuery';
import { fetchUserAnalytics } from '../../api/analytics';
import type {
  UserAnalyticsRow,
  UserAnalyticsParams,
} from '../../types/analytics';
import { AnalyticsTable } from './AnalyticsTable';
import { StatCard } from './StatCard';

const columnHelper = createColumnHelper<UserAnalyticsRow>();

const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  isActive: 'is_active',
  createdAt: 'created_at',
  totalOrders: 'total_orders',
  totalSpent: 'total_spent',
  totalDiscount: 'total_discount',
  promocodesUsed: 'promocodes_used',
};

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
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
  columnHelper.accessor('totalOrders', { header: 'Orders' }),
  columnHelper.accessor('totalSpent', {
    header: 'Spent',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('totalDiscount', {
    header: 'Discount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('promocodesUsed', { header: 'Promos Used' }),
];

export function UsersTable() {
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [debouncedName] = useDebouncedValue(nameInput, 500);
  const [debouncedEmail] = useDebouncedValue(emailInput, 500);

  const buildParams = useCallback(
    (base: {
      page: number;
      pageSize: number;
      sorting: { id: string; desc: boolean }[];
      filters: Record<string, string>;
      dateFrom: string;
      dateTo: string;
    }): UserAnalyticsParams => {
      const sort = base.sorting[0];
      return {
        page: base.page,
        pageSize: base.pageSize,
        sortBy: sort ? SORT_FIELD_MAP[sort.id] ?? sort.id : undefined,
        sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        dateFrom: base.dateFrom,
        dateTo: base.dateTo,
        name: base.filters.name || undefined,
        email: base.filters.email || undefined,
        isActive: base.filters.isActive || undefined,
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
    queryKey: 'analytics-users',
    fetchFn: fetchUserAnalytics,
    buildParams,
  });

  useEffect(() => { setFilter('name', debouncedName); }, [debouncedName, setFilter]);
  useEffect(() => { setFilter('email', debouncedEmail); }, [debouncedEmail, setFilter]);

  const filterNodes = (
    <>
      <TextInput
        placeholder="Filter by name"
        value={nameInput}
        onChange={(e) => setNameInput(e.currentTarget.value)}
        size="xs"
        w={180}
      />
      <TextInput
        placeholder="Filter by email"
        value={emailInput}
        onChange={(e) => setEmailInput(e.currentTarget.value)}
        size="xs"
        w={200}
      />
      <Select
        placeholder="Active"
        value={null}
        onChange={(val) => setFilter('isActive', val ?? '')}
        data={[
          { value: '', label: 'All' },
          { value: '1', label: 'Active' },
          { value: '0', label: 'Inactive' },
        ]}
        size="xs"
        w={120}
        clearable
      />
    </>
  );

  const stats = useMemo(() => {
    const totalSpent = data.reduce((s, r) => s + r.totalSpent, 0);
    const totalDiscount = data.reduce((s, r) => s + r.totalDiscount, 0);
    const totalPromos = data.reduce((s, r) => s + r.promocodesUsed, 0);
    return { totalSpent, totalDiscount, totalPromos };
  }, [data]);

  return (
    <>
      <SimpleGrid cols={{ base: 2, md: 4 }} mb="md">
        <StatCard label="Total Users" value={total} icon={IconUsers} />
        <StatCard label="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon={IconCash} />
        <StatCard label="Discounts Given" value={`$${stats.totalDiscount.toFixed(2)}`} icon={IconDiscount} />
        <StatCard label="Promos Used" value={stats.totalPromos} icon={IconTicket} />
      </SimpleGrid>
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
    </>
  );
}
