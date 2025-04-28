import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import EmailTest from '../../components/admin/EmailTest';

const DashboardPage = () => {
  const [showEmailTest, setShowEmailTest] = useState(false);

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => setShowEmailTest(!showEmailTest)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showEmailTest ? 'Hide Email Test' : 'Test Email System'}
        </button>
      </div>

      {showEmailTest && (
        <div className="mb-6">
          <EmailTest />
        </div>
      )}

      <Dashboard />
    </AdminLayout>
  );
};

export default DashboardPage;
