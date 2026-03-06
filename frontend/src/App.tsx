import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function HomePage() {
  return <div>PromoCode Manager</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
