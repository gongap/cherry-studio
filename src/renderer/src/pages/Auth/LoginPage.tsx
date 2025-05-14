import React, { useState } from 'react';
import styled from 'styled-components';

interface LoginPageProps {
  onLoginSuccess: (token: string, username: string) => void;
}

const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const LoginForm = styled.div`
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #40a9ff;
  }
`;

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login logic here
    console.log('Attempting to log in with:', { username, password });
    // Example: Call your backend API
    // api.login(username, password).then(response => { ... });

    // Placeholder for successful login - replace with actual logic
    const dummyToken = 'fake-auth-token';
    const dummyUsername = username || 'Guest User'; // Use entered username or a default
    onLoginSuccess(dummyToken, dummyUsername);
  };

  return (
    <LoginPageContainer>
      <LoginForm>
        <h2>Login</h2>
        <Input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>Login</Button>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage; 