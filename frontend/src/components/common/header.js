// Arquivo: frontend/src/components/common/Header.js

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate('/home')}>
            🎮 Raspadinha iGame
          </h1>
        </div>

        <nav className="header-nav">
          <button 
            className="nav-button"
            onClick={() => navigate('/home')}
          >
            Jogos
          </button>
          
          <button 
            className="nav-button"
            onClick={() => navigate('/user/dashboard')}
          >
            Minha Conta
          </button>

          {isAdmin() && (
            <button 
              className="nav-button admin-button"
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
          )}
        </nav>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Olá, {user?.name}</span>
            <span className="user-balance">R$ {parseFloat(user?.balance || 0).toFixed(2)}</span>
          </div>
          
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;