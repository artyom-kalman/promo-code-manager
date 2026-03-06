import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, TextInput, NumberInput, Button, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { Promocode } from '../../types/promocode';

const promocodeSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    discountPercent: z.number().min(1, 'Min 1%').max(100, 'Max 100%'),
    maxUsages: z.number().min(1, 'Min 1'),
    maxUsagesPerUser: z.number().min(1, 'Min 1'),
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: 'End date must be after start date', path: ['endDate'] },
  );

type PromocodeForm = z.infer<typeof promocodeSchema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: PromocodeForm) => Promise<void>;
  promocode?: Promocode | null;
}

export function PromocodeFormModal({
  opened,
  onClose,
  onSubmit,
  promocode,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromocodeForm>({
    resolver: zodResolver(promocodeSchema),
    defaultValues: {
      code: '',
      discountPercent: 10,
      maxUsages: 100,
      maxUsagesPerUser: 1,
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (opened) {
      if (promocode) {
        reset({
          code: promocode.code,
          discountPercent: promocode.discountPercent,
          maxUsages: promocode.maxUsages,
          maxUsagesPerUser: promocode.maxUsagesPerUser,
          startDate: promocode.startDate
            ? new Date(promocode.startDate)
            : null,
          endDate: promocode.endDate ? new Date(promocode.endDate) : null,
        });
      } else {
        reset({
          code: '',
          discountPercent: 10,
          maxUsages: 100,
          maxUsagesPerUser: 1,
          startDate: null,
          endDate: null,
        });
      }
    }
  }, [opened, promocode, reset]);

  const handleFormSubmit = async (data: PromocodeForm) => {
    await onSubmit(data);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={promocode ? 'Edit Promocode' : 'Create Promocode'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack>
          <TextInput
            label="Code"
            placeholder="SUMMER2024"
            {...register('code')}
            error={errors.code?.message}
          />
          <Controller
            name="discountPercent"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Discount %"
                min={1}
                max={100}
                value={field.value}
                onChange={(val) => field.onChange(val || 0)}
                error={errors.discountPercent?.message}
              />
            )}
          />
          <Controller
            name="maxUsages"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Max Usages"
                min={1}
                value={field.value}
                onChange={(val) => field.onChange(val || 0)}
                error={errors.maxUsages?.message}
              />
            )}
          />
          <Controller
            name="maxUsagesPerUser"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Max Usages Per User"
                min={1}
                value={field.value}
                onChange={(val) => field.onChange(val || 0)}
                error={errors.maxUsagesPerUser?.message}
              />
            )}
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Start Date (optional)"
                placeholder="Pick date"
                value={field.value}
                onChange={field.onChange}
                clearable
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="End Date (optional)"
                placeholder="Pick date"
                value={field.value}
                onChange={field.onChange}
                clearable
              />
            )}
          />
          <Button type="submit" loading={isSubmitting}>
            {promocode ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
