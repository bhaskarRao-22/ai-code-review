import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ReviewPage from './features/reviews/ReviewPage';
import ReviewHistoryPage from './features/reviews/ReviewHistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected app routes (abhi auth guard baad me add karenge) */}
        <Route element={<AppLayout />}>
          <Route path="/app/review" element={<ReviewPage />} />
          <Route path="/app/history" element={<ReviewHistoryPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
