import React from 'react';
import Button from '@/components/Button/Button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard container">
      <div className="notebook-page">
        <header style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h1 className="premium-title" style={{ textAlign: 'left', margin: 0 }}>Quản Trị Hệ Thống</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Xem Ứng Dụng</Button>
            <Button variant="danger" size="sm" onClick={() => navigate('/admin/login')}>Đăng Xuất</Button>
          </div>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '15px', 
          marginBottom: '40px' 
        }}>
          <div className="stat-card" style={statCardStyle}>
            <span style={statLabelStyle}>Tổng Số Thẻ</span>
            <p style={statValueStyle}>124</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <span style={statLabelStyle}>Lượt Xem</span>
            <p style={{ ...statValueStyle, color: '#10b981' }}>2.8k</p>
          </div>
          <div className="stat-card" style={statCardStyle}>
            <span style={statLabelStyle}>Thẻ Mới</span>
            <p style={{ ...statValueStyle, color: '#f59e0b' }}>12</p>
          </div>
        </div>

        <section className="management-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h2>Danh Sách Từ Vựng</h2>
            <Button variant="primary" size="sm">+ Thêm Thẻ Mới</Button>
          </div>
          
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead style={{ background: '#f9fafb', textAlign: 'left' }}>
                <tr>
                  <th style={thStyle}>Từ vựng</th>
                  <th style={thStyle}>Nghĩa</th>
                  <th style={thStyle} className="hidden-mobile">Ngày tạo</th>
                  <th style={thStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}><strong>Serendipity</strong></td>
                  <td style={tdStyle}>Sự tình cờ may mắn...</td>
                  <td style={tdStyle} className="hidden-mobile">2026-05-01</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <Button variant="ghost" size="sm">Sửa</Button>
                      <Button variant="ghost" size="sm" style={{ color: '#ef4444' }}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const statCardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '15px',
  borderRadius: '12px',
  border: '1px solid #f3f4f6',
  textAlign: 'center' as const,
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#4f46e5',
  margin: '5px 0 0 0',
};

const thStyle: React.CSSProperties = {
  padding: '12px 15px',
  borderBottom: '1px solid #f3f4f6',
  color: '#374151',
  fontWeight: 600,
  fontSize: '0.875rem',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 15px',
  borderBottom: '1px solid #f3f4f6',
  color: '#4b5563',
  fontSize: '0.875rem',
};

export default AdminDashboard;
