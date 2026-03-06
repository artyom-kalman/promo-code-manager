import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, TextInput, Button, Stack } from '@mantine/core';

const applySchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
});

type ApplyForm = z.infer<typeof applySchema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
}

export function ApplyPromocodeModal({ opened, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: ApplyForm) => {
    await onSubmit(data.code);
    reset();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Apply Promo Code">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack>
          <TextInput
            label="Promo Code"
            placeholder="Enter promo code"
            {...register('code')}
            error={errors.code?.message}
          />
          <Button type="submit" loading={isSubmitting} mt="sm">
            Apply
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
