// Arquivo: frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { loginUser } from '../services/api'; // Importa nossa função de login

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Novo estado para guardar mensagens de erro

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Limpa erros anteriores

    try {
      // Chama a função de login da nossa API
      const data = await loginUser(email, password);
      
      console.log('Login bem-sucedido!', data);
      
      // Guarda o token no armazenamento local do navegador
      localStorage.setItem('token', data.token);

      alert('Login realizado com sucesso! Token guardado.');
      // No futuro, redirecionaremos para a página de jogos:
      // window.location.href = '/home';

    } catch (err) {
      // Se a API retornar um erro, ele será capturado aqui
      console.error('Falha no login:', err);
      setError(err.message || 'Erro ao tentar fazer login.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Exibe a mensagem de erro, se houver */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;