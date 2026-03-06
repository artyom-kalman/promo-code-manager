import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Title,
  Button,
  Paper,
  Stack,
  NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../api/orders';
import { showErrorNotification } from '../lib/error';

const orderSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
});

type OrderForm = z.infer<typeof orderSchema>;

export function OrdersPage() {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { amount: 0 },
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      notifications.show({
        title: 'Success',
        message: 'Order created successfully',
        color: 'green',
      });
      reset();
    },
    onError: showErrorNotification,
  });

  const onSubmit = async (data: OrderForm) => {
    await mutation.mutateAsync(data);
  };

  return (
    <Container py="md" size="sm">
      <Title order={2} mb="md">
        Create Order
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Amount ($)"
                  placeholder="Enter order amount"
                  min={0.01}
                  decimalScale={2}
                  value={field.value}
                  onChange={(val) => field.onChange(val || 0)}
                  error={errors.amount?.message}
                />
              )}
            />
            <Button type="submit" loading={isSubmitting}>
              Create Order
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
