import { useNavigate, Link, Navigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import classes from './RegisterPage.module.css';

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
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={classes.brand}>Create Account</div>
        <div className={classes.subtitle}>
          Already have an account?{' '}
          <Link to="/login" className={classes.link}>Sign in</Link>
        </div>

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
      </div>
    </div>
  );
}
