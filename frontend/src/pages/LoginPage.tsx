import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/Button/Button';
import { apiService } from '../services/api';
import { loginSuccess } from '../features/auth/authSlice';
import './AdminLoginPage.less'; // We can rename the less file later

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await apiService.post('/auth/login', { username, password });
      dispatch(loginSuccess({ user: response.user, token: response.access_token }));
      navigate('/');
    } catch (err: any) {
      setError(err || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Đăng Nhập</h2>
        <p>Học từ vựng cá nhân của bạn</p>
        
        {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '15px' }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Nhập tên tài khoản"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          
          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </Button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
