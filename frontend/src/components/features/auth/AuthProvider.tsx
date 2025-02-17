import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// APIのURLを環境変数から取得
const API_URL = import.meta.env.VITE_API_URL;


// AuthProviderのProps型
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // アプリ初回レンダリング時にJWTを確認
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          credentials: 'include', // Cookieを含める
        });
        if (response.ok) {
          setIsAuthenticated(true);
          navigate('/dashboard'); 
        } else {
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
        navigate('/login');
      }
    };
    verifyToken();
  }, [navigate]);

  const login = () => {
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

