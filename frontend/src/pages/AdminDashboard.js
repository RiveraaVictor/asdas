// Arquivo: frontend/src/pages/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { adminReportService } from '../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminReportService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadDashboardStats}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Header />
      
      <div className="admin-container">
        <div className="admin-header">
          <h1>Dashboard Administrativo</h1>
          <p>Gerencie jogos, usuários e monitore a performance da plataforma</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total de Usuários</h3>
              <p className="stat-number">{stats?.totalUsers || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <h3>Jogos Jogados</h3>
              <p className="stat-number">{stats?.totalStats?.total_games_played || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Receita Total</h3>
              <p className="stat-number">R$ {parseFloat(stats?.totalStats?.total_bets || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>Prêmios Pagos</h3>
              <p className="stat-number">R$ {parseFloat(stats?.totalStats?.total_prizes || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Menu de Navegação */}
        <div className="admin-menu">
          <div className="menu-section">
            <h2>Gestão</h2>
            <div className="menu-grid">
              <button 
                className="menu-item"
                onClick={() => navigate('/admin/games')}
              >
                <div className="menu-icon">🎮</div>
                <div className="menu-content">
                  <h3>Gerenciar Jogos</h3>
                  <p>Criar, editar e configurar raspadinhas</p>
                </div>
              </button>

              <button 
                className="menu-item"
                onClick={() => navigate('/admin/users')}
              >
                <div className="menu-icon">👥</div>
                <div className="menu-content">
                  <h3>Gerenciar Usuários</h3>
                  <p>Visualizar e administrar contas de usuário</p>
                </div>
              </button>

              <button 
                className="menu-item"
                onClick={() => navigate('/admin/transactions')}
              >
                <div className="menu-icon">💳</div>
                <div className="menu-content">
                  <h3>Transações</h3>
                  <p>Aprovar saques e gerenciar pagamentos</p>
                </div>
              </button>

              <button 
                className="menu-item"
                onClick={() => navigate('/admin/coupons')}
              >
                <div className="menu-icon">🎟️</div>
                <div className="menu-content">
                  <h3>Cupons</h3>
                  <p>Criar e gerenciar cupons promocionais</p>
                </div>
              </button>
            </div>
          </div>

          <div className="menu-section">
            <h2>Relatórios</h2>
            <div className="menu-grid">
              <button 
                className="menu-item"
                onClick={() => navigate('/admin/reports/revenue')}
              >
                <div className="menu-icon">📊</div>
                <div className="menu-content">
                  <h3>Relatório Financeiro</h3>
                  <p>Receitas, custos e performance</p>
                </div>
              </button>

              <button 
                className="menu-item"
                onClick={() => navigate('/admin/reports/games')}
              >
                <div className="menu-icon">📈</div>
                <div className="menu-content">
                  <h3>Performance dos Jogos</h3>
                  <p>Análise detalhada de cada jogo</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Últimos Ganhadores */}
        {stats?.recentWinners && stats.recentWinners.length > 0 && (
          <div className="recent-winners">
            <h2>Últimos Ganhadores 🏆</h2>
            <div className="winners-list">
              {stats.recentWinners.map((winner, index) => (
                <div key={index} className="winner-item">
                  <div className="winner-info">
                    <strong>{winner.user_name}</strong>
                    <span>ganhou R$ {parseFloat(winner.prize_won).toFixed(2)}</span>
                  </div>
                  <div className="winner-game">
                    em {winner.game_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jogos Populares */}
        {stats?.popularGames && stats.popularGames.length > 0 && (
          <div className="popular-games">
            <h2>Jogos Mais Populares 🔥</h2>
            <div className="games-list">
              {stats.popularGames.map((game, index) => (
                <div key={game.id} className="game-item">
                  <div className="game-rank">#{index + 1}</div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p>{game.play_count || 0} jogadas</p>
                    <p>R$ {parseFloat(game.total_revenue || 0).toFixed(2)} em receita</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;