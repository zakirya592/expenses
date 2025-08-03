import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ExpensesPage from '../pages/Expenses/ExpensesPage';
import CustomerPage from '../pages/Customers/CustomerPage';
import CustomerDetails from '../pages/Customers/CustomerDetails';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/expenses" replace />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/customer-details/:customerId" element={<CustomerDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
