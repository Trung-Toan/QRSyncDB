import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import AddCash from '../pages/AddCash';
import Transactions from '../pages/Transactions';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Các Route Con: tự động chui vào vị trí của <Outlet /> */}
        <Route path="/" element={<Home />} />
        <Route path="/add-cash" element={<AddCash />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>

      {/* Route 404 (Không nằm trong MainLayout, có thể thiết kế màn hình full-screen) */}
      <Route 
        path="*" 
        element={<Home />}
      />
    </Routes>
  );
}