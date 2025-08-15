// Arquivo: frontend/src/components/admin/TransactionManager.js

import React, { useState, useEffect } from 'react';
import { adminTransactionService } from '../../services/adminService';

const TransactionManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 1
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const data = await adminTransactionService.getPendingWithdrawals();
        setPendingWithdrawals(data);
      } else {
        const data = await adminTransactionService.getAll(filters);
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      alert('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (transaction) => {
    const reference = prompt('Digite a referência externa do pagamento (opcional):');
    
    if (window.confirm(`Aprovar saque de R$ ${parseFloat(transaction.amount).toFixed(2)} para ${transaction.user_name}?`)) {
      try {
        await adminTransactionService.approve(transaction.id, reference);
        alert('Saque aprovado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao aprovar saque:', error);
        alert('Erro ao aprovar saque');
      }
    }
  };

  const handleRejectWithdrawal = async (transaction) => {
    const reason = prompt('Digite o motivo da rejeição:');
    
    if (reason && window.confirm(`Rejeitar saque de R$ ${parseFloat(transaction.amount).toFixed(2)}?`)) {
      try {
        await adminTransactionService.reject(transaction.id, reason);
        alert('Saque rejeitado. O valor foi devolvido ao usuário.');
        loadData();
      } catch (error) {
        console.error('Erro ao rejeitar saque:', error);
        alert('Erro ao rejeitar saque');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'black';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'deposit': return 'Depósito';
      case 'withdrawal': return 'Saque';
      case 'prize': return 'Prêmio';
      case 'game_cost': return 'Custo do Jogo';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="transaction-manager">
      <div className="manager-header">
        <h2>Gerenciar Transações</h2>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Saques Pendentes ({pendingWithdrawals.length})
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas as Transações
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="filters">
          <select 
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
          >
            <option value="">Todos os tipos</option>
            <option value="deposit">Depósitos</option>
            <option value="withdrawal">Saques</option>
            <option value="prize">Prêmios</option>
            <option value="game_cost">Custos de Jogo</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="completed">Concluída</option>
            <option value="failed">Falhou</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-withdrawals">
          {pendingWithdrawals.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum saque pendente.</p>
            </div>
          ) : (
            <div className="transactions-table">
              <div className="table-header">
                <div>Usuário</div>
                <div>Valor</div>
                <div>Data</div>
                <div>Método</div>
                <div>Ações</div>
              </div>
              
              {pendingWithdrawals.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="user-info">
                    <strong>{transaction.user_name}</strong>
                    <small>{transaction.user_email}</small>
                  </div>
                  
                  <div className="amount">
                    R$ {parseFloat(transaction.amount).toFixed(2)}
                  </div>
                  
                  <div className="date">
                    {formatDate(transaction.created_at)}
                  </div>
                  
                  <div className="payment-method">
                    {transaction.payment_method || 'Transferência'}
                  </div>
                  
                  <div className="actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleApproveWithdrawal(transaction)}
                    >
                      Aprovar
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleRejectWithdrawal(transaction)}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="all-transactions">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div className="transactions-table">
              <div className="table-header">
                <div>Usuário</div>
                <div>Tipo</div>
                <div>Valor</div>
                <div>Status</div>
                <div>Data</div>
                <div>Descrição</div>
              </div>
              
              {transactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="user-info">
                    <strong>{transaction.user_name}</strong>
                    <small>{transaction.user_email}</small>
                  </div>
                  
                  <div className="type">
                    {getTypeText(transaction.type)}
                  </div>
                  
                  <div className={`amount ${transaction.type === 'withdrawal' || transaction.type === 'game_cost' ? 'negative' : 'positive'}`}>
                    {transaction.type === 'withdrawal' || transaction.type === 'game_cost' ? '-' : '+'}
                    R$ {parseFloat(transaction.amount).toFixed(2)}
                  </div>
                  
                  <div className="status">
                    <span 
                      className="status-badge"
                      style={{ color: getStatusColor(transaction.status) }}
                    >
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                  
                  <div className="date">
                    {formatDate(transaction.created_at)}
                  </div>
                  
                  <div className="description">
                    {transaction.description || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionManager;