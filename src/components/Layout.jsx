import React from 'react';
import { Routes, Route,} from 'react-router-dom';
import ExpensesPage from '../pages/Expenses/ExpensesPage';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/expenses" element={<ExpensesPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
