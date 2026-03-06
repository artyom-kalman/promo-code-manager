import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  Badge,
  ActionIcon,
  LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPromocodes,
  createPromocode,
  updatePromocode,
  deactivatePromocode,
} from '../api/promocodes';
import { showErrorNotification } from '../lib/error';
import { PromocodeFormModal } from '../components/promocodes/PromocodeFormModal';
import type { Promocode } from '../types/promocode';

export function PromocodesPage() {
  const queryClient = useQueryClient();
  const [modalOpened, setModalOpened] = useState(false);
  const [editing, setEditing] = useState<Promocode | null>(null);

  const { data: promocodes = [], isLoading } = useQuery({
    queryKey: ['promocodes'],
    queryFn: getPromocodes,
  });

  const createMutation = useMutation({
    mutationFn: createPromocode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] });
      notifications.show({
        title: 'Success',
        message: 'Promocode created',
        color: 'green',
      });
      setModalOpened(false);
    },
    onError: showErrorNotification,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof updatePromocode>[1] }) =>
      updatePromocode(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] });
      notifications.show({
        title: 'Success',
        message: 'Promocode updated',
        color: 'green',
      });
      setModalOpened(false);
      setEditing(null);
    },
    onError: showErrorNotification,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivatePromocode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] });
      notifications.show({
        title: 'Success',
        message: 'Promocode deactivated',
        color: 'green',
      });
    },
    onError: showErrorNotification,
  });

  const handleSubmit = async (data: {
    code: string;
    discountPercent: number;
    maxUsages: number;
    maxUsagesPerUser: number;
    startDate?: Date | null;
    endDate?: Date | null;
  }) => {
    const dto = {
      code: data.code,
      discountPercent: data.discountPercent,
      maxUsages: data.maxUsages,
      maxUsagesPerUser: data.maxUsagesPerUser,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpened(true);
  };

  const openEdit = (promo: Promocode) => {
    setEditing(promo);
    setModalOpened(true);
  };

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : '—';

  return (
    <Container py="md" size="lg">
      <Group justify="space-between" mb="md">
        <Title order={2}>Promocodes</Title>
        <Button onClick={openCreate}>Create Promocode</Button>
      </Group>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Code</Table.Th>
              <Table.Th>Discount %</Table.Th>
              <Table.Th>Max Usages</Table.Th>
              <Table.Th>Per User</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {promocodes.map((promo) => (
              <Table.Tr key={promo._id}>
                <Table.Td>{promo.code}</Table.Td>
                <Table.Td>{promo.discountPercent}%</Table.Td>
                <Table.Td>{promo.maxUsages}</Table.Td>
                <Table.Td>{promo.maxUsagesPerUser}</Table.Td>
                <Table.Td>{formatDate(promo.startDate)}</Table.Td>
                <Table.Td>{formatDate(promo.endDate)}</Table.Td>
                <Table.Td>
                  <Badge color={promo.isActive ? 'green' : 'red'}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => openEdit(promo)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    {promo.isActive && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => deactivateMutation.mutate(promo._id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!isLoading && promocodes.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
                  No promocodes found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

      <PromocodeFormModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        promocode={editing}
      />
    </Container>
  );
}
