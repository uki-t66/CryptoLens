import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          credentials: 'include', // Cookie送信のために必要
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // 認証確認中はローディング表示
  if (isAuthenticated === null) {
    return <Navigate to="/dashboard" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};