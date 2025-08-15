// Arquivo: frontend/src/pages/LoginPage.js (ATUALIZADO)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redireciona baseado no papel do usuário
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🎮 Raspadinha iGame</h1>
            <h2>Entrar</h2>
            <p>Faça login para continuar jogando</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Digite seu e-mail"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/forgot-password">Esqueci minha senha</Link>
          </div>

          <div className="auth-footer">
            <p>
              Não tem uma conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </div>

          {/* Login de demonstração */}
          <div className="demo-login">
            <h4>Login de Demonstração:</h4>
            <p><strong>Admin:</strong> admin@raspadinha.com / admin123</p>
            <button 
              type="button"
              className="demo-button"
              onClick={() => {
                setEmail('admin@raspadinha.com');
                setPassword('admin123');
              }}
              disabled={loading}
            >
              Usar Login Admin
            </button>
          </div>
        </div>

        <div className="auth-info">
          <h3>Bem-vindo de volta!</h3>
          <ul>
            <li>🎰 Jogos de raspadinha online</li>
            <li>💎 Prêmios instantâneos</li>
            <li>🔒 Plataforma 100% segura</li>
            <li>⚡ Saques rápidos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;