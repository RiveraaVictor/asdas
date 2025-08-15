// Arquivo: frontend/src/pages/AdminTransactions.js

import React from 'react';
import Header from '../components/common/Header';
import TransactionManager from '../components/admin/TransactionManager';

const AdminTransactions = () => {
  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <div className="breadcrumb">
          <a href="/admin">Dashboard</a> &gt; Transações
        </div>
        <TransactionManager />
      </div>
    </div>
  );
};

export default AdminTransactions;