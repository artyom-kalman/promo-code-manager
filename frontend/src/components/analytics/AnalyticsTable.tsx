import { type ReactNode } from 'react';
import {
  Table,
  Group,
  Text,
  Pagination,
  Select,
  LoadingOverlay,
  Box,
  UnstyledButton,
} from '@mantine/core';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from '@tabler/icons-react';

interface AnalyticsTableProps<TRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TRow, any>[];
  data: TRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sorting: SortingState;
  isLoading: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortingChange: OnChangeFn<SortingState>;
  filters?: ReactNode;
}

const PAGE_SIZE_OPTIONS = ['10', '25', '50'];

export function AnalyticsTable<TRow>({
  columns,
  data,
  total,
  page,
  pageSize,
  totalPages,
  sorting,
  isLoading,
  isFetching,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  filters,
}: AnalyticsTableProps<TRow>) {
  "use no memo";
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
  });

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Box pos="relative">
      {filters && <Group mb="md" gap="sm">{filters}</Group>}

      <LoadingOverlay
        visible={isLoading || isFetching}
        overlayProps={{ blur: 1 }}
      />

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : canSort ? (
                      <UnstyledButton
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sorted === 'asc' ? (
                          <IconArrowUp size={14} />
                        ) : sorted === 'desc' ? (
                          <IconArrowDown size={14} />
                        ) : (
                          <IconArrowsSort size={14} color="gray" />
                        )}
                      </UnstyledButton>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length} ta="center" py="xl">
                <Text c="dimmed">No data found</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" mt="md">
        <Text size="sm" c="dimmed">
          Showing {from}–{to} of {total}
        </Text>
        <Group gap="sm">
          <Select
            value={String(pageSize)}
            onChange={(val) => val && onPageSizeChange(Number(val))}
            data={PAGE_SIZE_OPTIONS}
            w={80}
            size="xs"
          />
          <Pagination
            value={page}
            onChange={onPageChange}
            total={totalPages}
            size="sm"
          />
        </Group>
      </Group>
    </Box>
  );
}
