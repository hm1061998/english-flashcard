import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import './AdminLoginPage.less';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic cho login
    console.log('Đang đăng nhập...', { username, password });
    navigate('/admin/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Đăng Nhập Quản Trị</h2>
        <p>Truy cập bảng điều khiển quản lý hệ thống</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Nhập tên tài khoản admin"
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
          
          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px' }}>
            Đăng Nhập
          </Button>
        </form>
        
        <button className="back-link" onClick={() => navigate('/')}>
          ← Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
