import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  // パスワードのバリデーションルール
  const passwordRules = [
    { rule: /.{8,}/, message: '8文字以上' },
    { rule: /[A-Z]/, message: '大文字を含む' },
    { rule: /[a-z]/, message: '小文字を含む' },
    { rule: /[0-9]/, message: '数字を含む' },
    { rule: /[!@#$%^&*]/, message: '特殊文字(!@#$%^&*)を含む' }
  ];
    //パスワードのバリデーションエラーを状態管理
  const [passwordErrors, setPasswordErrors] = useState<string[]>(
    passwordRules.map(({ message }) => message) // 初期状態はすべてエラー扱い
  );

  // パスワード入力時のバリデーション
  const validatePassword = (value: string) => {
    const errors = passwordRules
      .filter(({ rule }) => !rule.test(value))
      .map(({ message }) => message);
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Cookie取得のために必要
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">新規登録</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-white mb-2">パスワード</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* パスワードルールの表示 */}
            <div className="mt-2 space-y-1">
              {passwordRules.map(({ message }, index) => (
                <div
                  key={index}
                  className={`text-sm flex items-center space-x-2 ${
                    passwordErrors.includes(message) ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full inline-block 
                    ${passwordErrors.includes(message) ? 'bg-red-400' : 'bg-green-400'}">
                  </span>
                  <span>{message}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={passwordErrors.length > 0}
          >
            登録
          </button>
        </form>
        <p className="mt-4 text-white text-center">
          すでにアカウントをお持ちの方は
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:underline ml-1"
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
};