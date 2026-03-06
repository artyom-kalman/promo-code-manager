import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { DateRangeProvider } from './context/DateRangeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PromocodesPage } from './pages/PromocodesPage';
import { OrdersPage } from './pages/OrdersPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} forceColorScheme="dark">
        <Notifications position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DateRangeProvider>
                      <AppLayout />
                    </DateRangeProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/promocodes" replace />} />
                <Route path="/promocodes" element={<PromocodesPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
