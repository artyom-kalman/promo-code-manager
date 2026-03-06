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
import classes from './AnalyticsTable.module.css';

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
    <div className={classes.wrapper}>
      {filters && <div className={classes.filterBar}>{filters}</div>}

      <Box pos="relative">
        <LoadingOverlay
          visible={isLoading || isFetching}
          overlayProps={{ blur: 1 }}
        />

        <Table className={classes.table} highlightOnHover>
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
                          className={`${classes.sortBtn} ${sorted ? classes.sortActive : ''}`}
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
                            <IconArrowsSort size={14} />
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
                  <Text c="var(--pcm-text-tertiary)">No data found</Text>
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
      </Box>

      <Group justify="space-between" className={classes.footer}>
        <Text size="sm" c="var(--pcm-text-secondary)">
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
    </div>
  );
}
