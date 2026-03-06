import { useState } from 'react';
import {
  Container,
  Title,
  Table,
  Badge,
  Button,
  LoadingOverlay,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, applyPromocode } from '../api/orders';
import { showErrorNotification } from '../lib/error';
import { ApplyPromocodeModal } from '../components/orders/ApplyPromocodeModal';
import classes from './MyOrdersPage.module.css';

export function MyOrdersPage() {
  const queryClient = useQueryClient();
  const [applyOrderId, setApplyOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });

  const applyMutation = useMutation({
    mutationFn: ({ orderId, code }: { orderId: string; code: string }) =>
      applyPromocode(orderId, { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      notifications.show({
        title: 'Success',
        message: 'Promo code applied',
        color: 'green',
      });
      setApplyOrderId(null);
    },
    onError: showErrorNotification,
  });

  const handleApply = async (code: string) => {
    if (!applyOrderId) return;
    await applyMutation.mutateAsync({ orderId: applyOrderId, code });
  };

  return (
    <Container py="md" size="lg">
      <Title order={2} mb="md" className={classes.pageTitle}>
        My Orders
      </Title>

      <div className={classes.tableWrapper} style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />
        <Table className={classes.table} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Promo Code</Table.Th>
              <Table.Th>Discount</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => {
              const promo =
                order.promocodeId && typeof order.promocodeId === 'object'
                  ? order.promocodeId
                  : null;
              return (
                <Table.Tr key={order._id}>
                  <Table.Td>${order.amount.toFixed(2)}</Table.Td>
                  <Table.Td>
                    {promo ? (
                      <Badge variant="light" color="yellow" className={classes.promoBadge}>
                        {promo.code}
                      </Badge>
                    ) : (
                      <Text size="sm" c="var(--pcm-text-tertiary)">
                        None
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {promo ? `${promo.discountPercent}%` : '—'}
                  </Table.Td>
                  <Table.Td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    {!promo && (
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => setApplyOrderId(order._id)}
                      >
                        Apply Promo
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
            {!isLoading && orders.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center', color: 'var(--pcm-text-tertiary)' }}>
                  No orders yet
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

      <ApplyPromocodeModal
        opened={!!applyOrderId}
        onClose={() => setApplyOrderId(null)}
        onSubmit={handleApply}
      />
    </Container>
  );
}
