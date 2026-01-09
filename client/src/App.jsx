import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import ShippingRates from './pages/ShippingRates';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="shipping" element={<ShippingRates />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

