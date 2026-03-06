import { Container, Tabs, Title } from '@mantine/core';
import { IconUsers, IconTicket, IconReceipt } from '@tabler/icons-react';
import { UsersTable } from '../components/analytics/UsersTable';
import { PromocodesTable } from '../components/analytics/PromocodesTable';
import { PromoUsagesTable } from '../components/analytics/PromoUsagesTable';

const tabStyles = {
  tab: {
    color: 'var(--pcm-text-secondary)',
    fontWeight: 600,
    fontSize: '0.8rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    borderBottom: '2px solid transparent',
    paddingBottom: 12,
    '&[dataActive]': {
      color: 'var(--pcm-accent)',
      borderBottomColor: 'var(--pcm-accent)',
    },
  },
  list: {
    borderBottom: '1px solid var(--pcm-border)',
    marginBottom: 20,
  },
};

export function AnalyticsPage() {
  return (
    <Container fluid py="md" px="lg">
      <Title
        order={2}
        mb="lg"
        style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: 'var(--pcm-text-primary)' }}
      >
        Analytics
      </Title>

      <Tabs defaultValue="users" styles={tabStyles}>
        <Tabs.List>
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            Users
          </Tabs.Tab>
          <Tabs.Tab value="promocodes" leftSection={<IconTicket size={16} />}>
            Promocodes
          </Tabs.Tab>
          <Tabs.Tab value="usages" leftSection={<IconReceipt size={16} />}>
            Promo Usages
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="md">
          <UsersTable />
        </Tabs.Panel>
        <Tabs.Panel value="promocodes" pt="md">
          <PromocodesTable />
        </Tabs.Panel>
        <Tabs.Panel value="usages" pt="md">
          <PromoUsagesTable />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
