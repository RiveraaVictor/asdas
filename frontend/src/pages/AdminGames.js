// Arquivo: frontend/src/pages/AdminGames.js

import React from 'react';
import Header from '../components/common/Header';
import GameManager from '../components/admin/GameManager';

const AdminGames = () => {
  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <div className="breadcrumb">
          <a href="/admin">Dashboard</a> &gt; Gerenciar Jogos
        </div>
        <GameManager />
      </div>
    </div>
  );
};

export default AdminGames;