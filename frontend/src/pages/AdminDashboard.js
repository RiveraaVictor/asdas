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
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null); // Limpa erros anteriores
        const data = await adminReportService.getDashboardStats();
        setStats(data); // Armazena os dados recebidos
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Header />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error || !stats) { // Adicionada verificação para !stats
    return (
      <div className="admin-dashboard">
        <Header />
        <div className="error-container">
          <p>{error || 'Não foi possível carregar os dados.'}</p>
          <button onClick={() => window.location.reload()}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  // CORREÇÃO: Acessando as propriedades com os nomes corretos (snake_case)
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
            <h3>Total de Usuários</h3>
            <p className="stat-number">{stats.totalUsers || stats.total_users || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Jogos Jogados</h3>
            <p className="stat-number">{stats.totalStats?.total_games_played || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Receita Total</h3>
            <p className="stat-number">R$ {parseFloat(stats.totalStats?.total_bets || 0).toFixed(2)}</p>
          </div>

          <div className="stat-card">
            <h3>Prêmios Pagos</h3>
            <p className="stat-number">R$ {parseFloat(stats.totalStats?.total_prizes || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Menu de Navegação (omitido por brevidade, o seu código está correto) */}
        {/* ... */}

        {/* Últimos Ganhadores */}
        {stats.recentWinners && stats.recentWinners.length > 0 && (
          <div className="recent-winners">
            <h2>Últimos Ganhadores 🏆</h2>
            {stats.recentWinners.map((winner, index) => (
              <div key={index} className="winner-item">
                <strong>{winner.user_name}</strong>
                <span> ganhou R$ {parseFloat(winner.prize_won).toFixed(2)}</span>
                <span> em {winner.game_name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Jogos Populares */}
        {stats.popularGames && stats.popularGames.length > 0 && (
          <div className="popular-games">
            <h2>Jogos Mais Populares 🔥</h2>
            {stats.popularGames.map((game, index) => (
              <div key={game.id} className="game-item">
                <h3>#{index + 1} - {game.name}</h3>
                <p>{game.play_count || 0} jogadas</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
