// Arquivo: frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// Importe o componente que acabamos de criar
import LoginPage from './pages/LoginPage'; 

// const RegisterPage = () => <h1>Página de Cadastro</h1>;
// const HomePage = () => <h1>Página Principal (Jogos)</h1>;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Use o componente na rota /login */}
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<h1>Página de Cadastro</h1>} />
          <Route path="/home" element={<h1>Página Principal (Jogos)</h1>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;