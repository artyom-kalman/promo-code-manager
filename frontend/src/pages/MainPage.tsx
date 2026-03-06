import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

export function MainPage() {
  const { user, logout } = useAuth();

  return (
    <Container size="sm" py="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>PromoCode Manager</Title>
          <Text c="dimmed">Welcome, {user?.email}</Text>
        </div>
        <Button variant="light" color="gray" onClick={logout}>
          Logout
        </Button>
      </Group>
    </Container>
  );
}
