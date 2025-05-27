
import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // TODO: Implement actual authentication logic with backend API
    console.log('Login attempt:', { email, password });
    
    // Simulate successful login for now
    setUser({ email });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic with backend API
    console.log('User logged out');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      <LoginForm onLogin={handleLogin} />
      <Toaster />
    </>
  );
};

export default Index;
