// Arquivo: frontend/src/App.js (ATUALIZADO)

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Páginas de autenticação
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas principais
import HomePage from './pages/HomePage';

// Páginas administrativas
import AdminDashboard from './pages/AdminDashboard';
import AdminGames from './pages/AdminGames';
import AdminTransactions from './pages/AdminTransactions';
import AdminCoupons from './pages/AdminCoupons';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rotas protegidas - usuários autenticados */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />

            {/* Rotas administrativas */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/games" 
              element={
                <ProtectedRoute adminRequired={true}>
                  <AdminGames />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/transactions" 
              element={
                <ProtectedRoute adminRequired={true}>
                  <AdminTransactions />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/coupons" 
              element={
                <ProtectedRoute adminRequired={true}>
                  <AdminCoupons />
                </ProtectedRoute>
              } 
            />

            {/* Rotas do usuário (implementar na próxima fase) */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute>
                  <div>Dashboard do Usuário - Em breve</div>
                </ProtectedRoute>
              } 
            />

            {/* Rota raiz - redireciona baseado no estado de autenticação */}
            <Route 
              path="/" 
              element={<Navigate to="/home" replace />} 
            />

            {/* Rotas não encontradas */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;