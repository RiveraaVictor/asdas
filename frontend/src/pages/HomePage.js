// Arquivo: frontend/src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [popularGames, setPopularGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
    loadPopularGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await api.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      setError('Erro ao carregar jogos');
    }
  };

  const loadPopularGames = async () => {
    try {
      const response = await api.get('/games/popular');
      setPopularGames(response.data);
    } catch (error) {
      console.error('Erro ao carregar jogos populares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = async (game) => {
    if (user.balance < game.price) {
      alert(`Saldo insuficiente! Você precisa de R$ ${game.price.toFixed(2)} para jogar.`);
      return;
    }

    if (window.confirm(`Jogar ${game.name} por R$ ${game.price.toFixed(2)}?`)) {
      try {
        const response = await api.post(`/games/${game.id}/play`);
        const result = response.data;

        // Atualiza o saldo do usuário
        updateUser({ balance: result.result.newBalance });

        // Mostra o resultado
        if (result.result.isWinner) {
          alert(`🎉 ${result.message}\n\nSeu novo saldo: R$ ${result.result.newBalance.toFixed(2)}`);
        } else {
          alert(`😔 ${result.message}\n\nSeu saldo: R$ ${result.result.newBalance.toFixed(2)}`);
        }

        // Atualiza a lista de jogos populares
        loadPopularGames();
      } catch (error) {
        console.error('Erro ao jogar:', error);
        alert('Erro ao processar a jogada: ' + (error.response?.data?.message || 'Erro desconhecido'));
      }
    }
  };

  const getThemeEmoji = (theme) => {
    switch (theme) {
      case 'classic': return '🎰';
      case 'pirate': return '🏴‍☠️';
      case 'fruit': return '🍓';
      case 'jackpot': return '💎';
      case 'adventure': return '🗺️';
      case 'fantasy': return '🧙‍♂️';
      case 'sports': return '⚽';
      case 'casino': return '🎲';
      default: return '🎮';
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando jogos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadGames}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>🎮 Bem-vindo ao Raspadinha iGame!</h1>
          <p>Escolha seu jogo favorito e ganhe prêmios instantâneos!</p>
          <div className="user-balance">
            <span>Seu saldo: <strong>R$ {parseFloat(user.balance || 0).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Jogos Populares */}
        {popularGames.length > 0 && (
          <div className="section">
            <h2>🔥 Jogos Mais Populares</h2>
            <div className="games-grid">
              {popularGames.slice(0, 4).map(game => (
                <div key={game.id} className="game-card popular">
                  <div className="game-icon">
                    {getThemeEmoji(game.theme)}
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="game-price">R$ {parseFloat(game.price).toFixed(2)}</p>
                    <p className="game-description">{game.description}</p>
                    <div className="game-stats">
                      <span>🎯 RTP: {game.rtp}%</span>
                      <span>🏆 {game.play_count || 0} jogadas</span>
                    </div>
                  </div>
                  <button 
                    className="play-button"
                    onClick={() => handlePlayGame(game)}
                    disabled={user.balance < game.price}
                  >
                    {user.balance < game.price ? 'Saldo Insuficiente' : 'Jogar Agora'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Jogos */}
        <div className="section">
          <h2>🎰 Todos os Jogos</h2>
          {games.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum jogo disponível no momento.</p>
            </div>
          ) : (
            <div className="games-grid">
              {games.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-icon">
                    {getThemeEmoji(game.theme)}
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="game-price">R$ {parseFloat(game.price).toFixed(2)}</p>
                    <p className="game-description">{game.description}</p>
                    <div className="game-stats">
                      <span>🎯 RTP: {game.rtp}%</span>
                    </div>
                  </div>
                  <button 
                    className="play-button"
                    onClick={() => handlePlayGame(game)}
                    disabled={user.balance < game.price}
                  >
                    {user.balance < game.price ? 'Saldo Insuficiente' : 'Jogar Agora'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <h2>💰 Precisa de mais créditos?</h2>
          <p>Recarregue sua conta para continuar jogando!</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/user/dashboard')}
          >
            Recarregar Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;