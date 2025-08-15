// Arquivo: frontend/src/pages/AdminCoupons.js

import React from 'react';
import Header from '../components/common/Header';
import CouponManager from '../components/admin/CouponManager';

const AdminCoupons = () => {
  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <div className="breadcrumb">
          <a href="/admin">Dashboard</a> &gt; Cupons
        </div>
        <CouponManager />
      </div>
    </div>
  );
};

export default AdminCoupons;