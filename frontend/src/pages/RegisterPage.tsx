import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/Button/Button';
import { apiService } from '../services/api';
import { loginSuccess } from '../features/auth/authSlice';
import './AdminLoginPage.less';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response: any = await apiService.post('/auth/register', { username, password });
      dispatch(loginSuccess({ user: response.user, token: response.access_token }));
      navigate('/');
    } catch (err: any) {
      setError(err || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Đăng Ký</h2>
        <p>Tạo tài khoản học tiếng Anh miễn phí</p>
        
        {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '15px' }}>{error}</p>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Chọn tên tài khoản"
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

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>
          
          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
          </Button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
