import { Container, Tabs, Title } from '@mantine/core';
import { IconUsers, IconTicket, IconReceipt } from '@tabler/icons-react';
import { UsersTable } from '../components/analytics/UsersTable';
import { PromocodesTable } from '../components/analytics/PromocodesTable';
import { PromoUsagesTable } from '../components/analytics/PromoUsagesTable';

export function AnalyticsPage() {
  return (
    <Container fluid py="md">
      <Title order={2} mb="md">
        Analytics
      </Title>

      <Tabs defaultValue="users">
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
