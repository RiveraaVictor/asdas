// Arquivo: frontend/src/components/admin/GameManager.js

import React, { useState, useEffect } from 'react';
import { adminGameService, adminPrizeService } from '../../services/adminService';

const GameManager = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    theme: '',
    description: '',
    rtp: '95.00'
  });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await adminGameService.getAll();
      setGames(data);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      alert('Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const gameData = {
        ...formData,
        price: parseFloat(formData.price),
        rtp: parseFloat(formData.rtp)
      };

      if (editingGame) {
        await adminGameService.update(editingGame.id, gameData);
        alert('Jogo atualizado com sucesso!');
      } else {
        await adminGameService.create(gameData);
        alert('Jogo criado com sucesso!');
      }

      setShowForm(false);
      setEditingGame(null);
      setFormData({
        name: '',
        price: '',
        theme: '',
        description: '',
        rtp: '95.00'
      });
      loadGames();
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      alert('Erro ao salvar jogo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      price: game.price.toString(),
      theme: game.theme || '',
      description: game.description || '',
      rtp: game.rtp.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (game) => {
    if (!window.confirm(`Tem certeza que deseja deletar o jogo "${game.name}"?`)) {
      return;
    }

    try {
      await adminGameService.delete(game.id);
      alert('Jogo deletado com sucesso!');
      loadGames();
    } catch (error) {
      console.error('Erro ao deletar jogo:', error);
      alert('Erro ao deletar jogo');
    }
  };

  const handleToggleStatus = async (game) => {
    try {
      await adminGameService.toggleStatus(game.id);
      loadGames();
    } catch (error) {
      console.error('Erro ao alterar status do jogo:', error);
      alert('Erro ao alterar status do jogo');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando jogos...</p>
      </div>
    );
  }

  return (
    <div className="game-manager">
      <div className="manager-header">
        <h2>Gerenciar Jogos</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Novo Jogo
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingGame ? 'Editar Jogo' : 'Novo Jogo'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingGame(null);
                  setFormData({
                    name: '',
                    price: '',
                    theme: '',
                    description: '',
                    rtp: '95.00'
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome do Jogo*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Raspadinha Clássica"
                />
              </div>

              <div className="form-group">
                <label>Preço (R$)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="5.00"
                />
              </div>

              <div className="form-group">
                <label>Tema</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione um tema</option>
                  <option value="classic">Clássico</option>
                  <option value="pirate">Pirata</option>
                  <option value="fruit">Frutas</option>
                  <option value="jackpot">Jackpot</option>
                  <option value="adventure">Aventura</option>
                  <option value="fantasy">Fantasia</option>
                  <option value="sports">Esportes</option>
                  <option value="casino">Casino</option>
                </select>
              </div>

              <div className="form-group">
                <label>RTP (%)*</label>
                <input
                  type="number"
                  name="rtp"
                  value={formData.rtp}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="95.00"
                />
                <small>Return to Player - Porcentagem de retorno aos jogadores</small>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Descreva o jogo..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingGame ? 'Atualizar' : 'Criar'} Jogo
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGame(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className={`game-card ${!game.is_active ? 'inactive' : ''}`}>
            <div className="game-header">
              <h3>{game.name}</h3>
              <div className="game-status">
                {game.is_active ? (
                  <span className="status-active">Ativo</span>
                ) : (
                  <span className="status-inactive">Inativo</span>
                )}
              </div>
            </div>

            <div className="game-details">
              <p><strong>Preço:</strong> R$ {parseFloat(game.price).toFixed(2)}</p>
              <p><strong>Tema:</strong> {game.theme || 'Não definido'}</p>
              <p><strong>RTP:</strong> {game.rtp}%</p>
              {game.description && (
                <p><strong>Descrição:</strong> {game.description}</p>
              )}
            </div>

            <div className="game-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEdit(game)}
              >
                Editar
              </button>
              
              <button 
                className={`btn-toggle ${game.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                onClick={() => handleToggleStatus(game)}
              >
                {game.is_active ? 'Desativar' : 'Ativar'}
              </button>
              
              <button 
                className="btn-delete"
                onClick={() => handleDelete(game)}
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="empty-state">
          <p>Nenhum jogo encontrado.</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Criar Primeiro Jogo
          </button>
        </div>
      )}
    </div>
  );
};

export default GameManager;