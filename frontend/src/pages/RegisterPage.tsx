import { useNavigate, Link, Navigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      navigate('/', { replace: true });
    } catch {
      // error handled in AuthContext
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Create an account</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Your name"
              {...register('name')}
              error={errors.name?.message}
            />
            <TextInput
              label="Email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <TextInput
              label="Phone"
              placeholder="+1234567890"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <PasswordInput
              label="Password"
              placeholder="Min 8 characters"
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
