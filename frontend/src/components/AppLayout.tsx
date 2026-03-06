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
import classes from './AppLayout.module.css';

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

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <span className={classes.brand}>PromoCode Manager</span>
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

      <AppShell.Navbar className={classes.navbar} p="sm">
        <AppShell.Section grow>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.5} />}
                active={isActive}
                onClick={() => {
                  navigate(item.path);
                  close();
                }}
                variant="subtle"
                className={`${classes.navLink} ${isActive ? classes.navLinkActive : ''}`}
              />
            );
          })}
        </AppShell.Section>

        <AppShell.Section>
          <Box className={classes.userSection}>
            <Group gap="sm" mb={8}>
              <div className={classes.avatar}>{initials}</div>
              <Text size="sm" c="var(--pcm-text-secondary)" truncate style={{ flex: 1 }}>
                {user?.email}
              </Text>
            </Group>
            <UnstyledButton onClick={logout} className={classes.logoutBtn}>
              <IconLogout size={16} />
              <Text size="sm">Logout</Text>
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
