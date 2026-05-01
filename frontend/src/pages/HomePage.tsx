import React, { useState, useEffect } from 'react';
import Flashcard from '@/components/Flashcard/Flashcard';
import Button from '@/components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { apiService } from '@/services/api';
import { logout } from '@/features/auth/authSlice';

interface Word {
  id?: string;
  word: string;
  phonetic: string;
  meaning: string;
  example?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [meaning, setMeaning] = useState('');

  const [displayConfig, setDisplayConfig] = useState({
    showWord: true,
    showMeaning: true,
    showExample: true,
    showPhonetic: false,
  });

  const [myWords, setMyWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auth Check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchWords();
    }
  }, [isAuthenticated]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      // Fetch a larger batch for randomized learning
      const response: any = await apiService.get('/flashcards?page=1&limit=100');
      const words = response.data || [];
      setMyWords(words);
      if (words.length > 0) {
        setCurrentIndex(Math.floor(Math.random() * words.length));
      }
    } catch (err) {
      console.error('Failed to fetch words', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!word || !meaning) return;
    try {
      const newEntry: any = await apiService.post('/flashcards', { word, phonetic, meaning, example: 'Ví dụ mới' });
      setMyWords([newEntry, ...myWords]);
      setIsAdding(false);
      setWord(''); setPhonetic(''); setMeaning('');
    } catch (err) {
      alert('Không thể lưu từ vựng');
    }
  };

  const handleFeedback = (_level: string) => {
    setIsTransitioning(true);
    if (myWords.length > 1) {
      let nextIndex = currentIndex;
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * myWords.length);
      }
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsTransitioning(false);
      }, 400); 
    } else {
      setTimeout(() => setIsTransitioning(false), 400);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleConfig = (key: keyof typeof displayConfig) => {
    setDisplayConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="home-page container">
      <div className="notebook-page">
        <header className="page-header" style={headerStyle}>
          <div className="header-content">
            <h1 className="premium-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>Chào, {user?.username}</h1>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '5px' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/list')}>Danh Sách</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>Cài Đặt</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Hủy' : 'Thêm'}</Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: 'red' }}>Đăng xuất</Button>
          </div>
        </header>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {showSettings && (
            <div className="settings-panel" style={overlayStyle}>
              <h4 style={{ marginBottom: '10px' }}>Tùy chọn hiển thị</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={checkboxLabelStyle}><input type="checkbox" checked={displayConfig.showWord} onChange={() => toggleConfig('showWord')} /> Hiện từ</label>
                <label style={checkboxLabelStyle}><input type="checkbox" checked={displayConfig.showPhonetic} onChange={() => toggleConfig('showPhonetic')} /> Hiện phiên âm</label>
                <label style={checkboxLabelStyle}><input type="checkbox" checked={displayConfig.showMeaning} onChange={() => toggleConfig('showMeaning')} /> Hiện nghĩa</label>
                <label style={checkboxLabelStyle}><input type="checkbox" checked={displayConfig.showExample} onChange={() => toggleConfig('showExample')} /> Hiện ví dụ</label>
              </div>
              <Button size="sm" style={{ marginTop: '15px', width: '100%' }} onClick={() => setShowSettings(false)}>Xong</Button>
            </div>
          )}

          {isAdding && (
            <div className="add-word-form" style={overlayStyle}>
              <h3 style={{ marginBottom: '10px' }}>Thêm từ mới</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Từ vựng" value={word} onChange={(e) => setWord(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Phiên âm" value={phonetic} onChange={(e) => setPhonetic(e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Nghĩa" value={meaning} onChange={(e) => setMeaning(e.target.value)} style={inputStyle} />
                <Button size="sm" onClick={handleSave}>Lưu</Button>
              </div>
            </div>
          )}

          <main className={`active-card-container ${isTransitioning ? 'card-exit' : 'card-enter'}`} style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            width: '100%',
            position: 'relative'
          }}>
            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : myWords.length > 0 ? (
              <Flashcard 
                key={`${currentIndex}-${myWords[currentIndex].id}`}
                {...myWords[currentIndex]} 
                displayConfig={displayConfig} 
                onFeedback={handleFeedback}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <p>Bạn chưa có từ vựng nào.</p>
                <Button size="sm" onClick={() => setIsAdding(true)}>Thêm từ đầu tiên</Button>
              </div>
            )}
          </main>
        </div>

        <footer style={{ textAlign: 'center', padding: '10px 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.65rem' }}>SRS Flashcard | {myWords.length} từ vựng</p>
        </footer>
      </div>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  marginBottom: '10px',
  borderBottom: '1px solid #f3f4f6',
  paddingBottom: '10px',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  background: 'white',
  padding: '15px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb'
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  outline: 'none',
  fontSize: '0.9rem'
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

export default HomePage;
