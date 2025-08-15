// Arquivo: frontend/src/components/admin/CouponManager.js

import React, { useState, useEffect } from 'react';
import { adminCouponService, adminGameService } from '../../services/adminService';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'bonus_balance',
    value: '',
    gameId: '',
    usageLimit: '100',
    expiresAt: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [couponsData, gamesData] = await Promise.all([
        adminCouponService.getAll(),
        adminGameService.getAll()
      ]);
      setCoupons(couponsData);
      setGames(gamesData.filter(game => game.is_active));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
        usageLimit: parseInt(formData.usageLimit),
        gameId: formData.gameId || null,
        expiresAt: formData.expiresAt || null
      };

      if (editingCoupon) {
        await adminCouponService.update(editingCoupon.id, couponData);
        alert('Cupom atualizado com sucesso!');
      } else {
        await adminCouponService.create(couponData);
        alert('Cupom criado com sucesso!');
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      alert('Erro ao salvar cupom: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      gameId: coupon.game_id || '',
      usageLimit: coupon.usage_limit.toString(),
      expiresAt: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
      description: coupon.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Tem certeza que deseja deletar o cupom "${coupon.code}"?`)) {
      return;
    }

    try {
      await adminCouponService.delete(coupon.id);
      alert('Cupom deletado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      alert('Erro ao deletar cupom');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'bonus_balance',
      value: '',
      gameId: '',
      usageLimit: '100',
      expiresAt: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'bonus_balance': return 'Bônus de Saldo';
      case 'free_game': return 'Jogo Grátis';
      case 'cashback': return 'Cashback';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString('pt-BR') : '-';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando cupons...</p>
      </div>
    );
  }

  return (
    <div className="coupon-manager">
      <div className="manager-header">
        <h2>Gerenciar Cupons</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Novo Cupom
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h3>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código do Cupom*</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: WELCOME10"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Tipo*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="bonus_balance">Bônus de Saldo</option>
                  <option value="free_game">Jogo Grátis</option>
                  <option value="cashback">Cashback</option>
                </select>
              </div>

              <div className="form-group">
                <label>Valor (R$)*</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="10.00"
                />
              </div>

              {formData.type === 'free_game' && (
                <div className="form-group">
                  <label>Jogo Específico</label>
                  <select
                    name="gameId"
                    value={formData.gameId}
                    onChange={handleInputChange}
                  >
                    <option value="">Qualquer jogo</option>
                    {games.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name} - R$ {parseFloat(game.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Limite de Uso*</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="100"
                />
              </div>

              <div className="form-group">
                <label>Data de Expiração</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                />
                <small>Deixe em branco para não expirar</small>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Descreva o cupom..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="coupons-table">
        {coupons.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cupom encontrado.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Criar Primeiro Cupom
            </button>
          </div>
        ) : (
          <>
            <div className="table-header">
              <div>Código</div>
              <div>Tipo</div>
              <div>Valor</div>
              <div>Uso</div>
              <div>Expira</div>
              <div>Status</div>
              <div>Ações</div>
            </div>
            
            {coupons.map(coupon => (
              <div key={coupon.id} className={`table-row ${!coupon.is_active ? 'inactive' : ''}`}>
                <div className="coupon-code">
                  <strong>{coupon.code}</strong>
                  {coupon.description && (
                    <small>{coupon.description}</small>
                  )}
                </div>
                
                <div className="coupon-type">
                  {getTypeText(coupon.type)}
                  {coupon.game_name && (
                    <small>({coupon.game_name})</small>
                  )}
                </div>
                
                <div className="coupon-value">
                  R$ {parseFloat(coupon.value).toFixed(2)}
                </div>
                
                <div className="coupon-usage">
                  {coupon.used_count} / {coupon.usage_limit}
                </div>
                
                <div className="coupon-expires">
                  {formatDate(coupon.expires_at)}
                </div>
                
                <div className="coupon-status">
                  {coupon.is_active ? (
                    <span className="status-active">Ativo</span>
                  ) : (
                    <span className="status-inactive">Inativo</span>
                  )}
                </div>
                
                <div className="coupon-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(coupon)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(coupon)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CouponManager;