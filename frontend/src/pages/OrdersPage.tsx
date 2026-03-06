import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container,
  Title,
  Button,
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
      <Title
        order={2}
        mb="md"
        style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: 'var(--pcm-text-primary)' }}
      >
        Create Order
      </Title>
      <div style={{
        backgroundColor: 'var(--pcm-bg-surface)',
        border: '1px solid var(--pcm-border)',
        borderRadius: 'var(--mantine-radius-md)',
        padding: 30,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--pcm-accent)',
        }} />
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
      </div>
    </Container>
  );
}
