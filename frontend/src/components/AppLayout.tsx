import { useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  SegmentedControl,
  Text,
  UnstyledButton,
  Box,
} from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
  IconTicket,
  IconShoppingCart,
  IconReceipt,
  IconChartBar,
  IconLogout,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useDateRange, type DatePreset } from '../context/DateRangeContext';

const navItems = [
  { label: 'Promocodes', path: '/promocodes', icon: IconTicket },
  { label: 'Orders', path: '/orders', icon: IconShoppingCart },
  { label: 'My Orders', path: '/my-orders', icon: IconReceipt },
  { label: 'Analytics', path: '/analytics', icon: IconChartBar },
] as const;

const presetData = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7days' },
  { label: '30 days', value: '30days' },
  { label: 'Custom', value: 'custom' },
];

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { preset, dateFrom, dateTo, setPreset, setCustomRange } = useDateRange();
  const [customRange, setLocalCustomRange] = useState<DatesRangeValue>([
    dateFrom.toISOString(),
    dateTo.toISOString(),
  ]);

  const handlePresetChange = (value: string) => {
    setPreset(value as DatePreset);
  };

  const handleCustomRangeChange = (value: DatesRangeValue) => {
    setLocalCustomRange(value);
    if (value[0] && value[1]) {
      setCustomRange(new Date(value[0]), new Date(value[1]));
    }
  };

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">
              PromoCode Manager
            </Text>
          </Group>
          <Group gap="sm">
            <SegmentedControl
              size="xs"
              data={presetData}
              value={preset}
              onChange={handlePresetChange}
            />
            {preset === 'custom' && (
              <DatePickerInput
                type="range"
                size="xs"
                placeholder="Pick range"
                value={customRange}
                onChange={handleCustomRangeChange}
                maxDate={new Date()}
                clearable={false}
              />
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar bg="dark.7" p="sm">
        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.5} />}
              active={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                close();
              }}
              color="blue"
              variant="filled"
              styles={{
                root: { borderRadius: 6, marginBottom: 4, color: 'var(--mantine-color-dark-0)' },
              }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Box
            style={{ borderTop: '1px solid var(--mantine-color-dark-4)', paddingTop: 12 }}
          >
            <Text size="sm" c="dark.2" mb={4} truncate>
              {user?.email}
            </Text>
            <UnstyledButton
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <IconLogout size={16} color="var(--mantine-color-dark-2)" />
              <Text size="sm" c="dark.2">
                Logout
              </Text>
            </UnstyledButton>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
