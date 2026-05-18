import React, { useState, useEffect } from 'react';
import Flashcard from '@/components/Flashcard/Flashcard';
import Button from '@/components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { apiService } from '@/services/api';
import { logout } from '@/features/auth/authSlice';
import FlashcardForm from '@/components/FlashcardForm/FlashcardForm';
import { Modal } from "@/libs/Modal";

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

  const [formLoading, setFormLoading] = useState(false);

  const [displayConfig, setDisplayConfig] = useState({
    showWord: true,
    showMeaning: true,
    showExample: true,
    showPhonetic: false,
  });

  const [myWords, setMyWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [topics, setTopics] = useState<any[]>([]);

  // Auth Check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchTopics();
    }
  }, [isAuthenticated]);

  // Fetch words on topic change
  useEffect(() => {
    if (isAuthenticated) {
      fetchWords(selectedTopicId);
    }
  }, [isAuthenticated, selectedTopicId]);

  const fetchTopics = async () => {
    try {
      const response: any = await apiService.get('/topics');
      setTopics(response || []);
    } catch (err) {
      console.error('Failed to fetch topics', err);
    }
  };

  const fetchWords = async (topicId?: string) => {
    setLoading(true);
    try {
      // Fetch a larger batch for randomized learning
      let url = '/flashcards?page=1&limit=100';
      if (topicId) {
        url += `&topicId=${topicId}`;
      }
      const response: any = await apiService.get(url);
      const words = response.data || [];
      setMyWords(words);
      if (words.length > 0) {
        setCurrentIndex(Math.floor(Math.random() * words.length));
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to fetch words', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    setFormLoading(true);
    try {
      await apiService.post('/flashcards', formData);
      await Promise.all([
        fetchTopics(),
        fetchWords(selectedTopicId)
      ]);
      setIsAdding(false);
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Không thể lưu từ vựng');
    } finally {
      setFormLoading(false);
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

          <Modal
            isOpen={isAdding}
            onClose={() => setIsAdding(false)}
            title="Thêm từ vựng mới"
          >
            <FlashcardForm
              onSubmit={handleSave}
              onCancel={() => setIsAdding(false)}
              submitLabel="Thêm mới"
              loading={formLoading}
            />
          </Modal>

          {/* Topic Filters */}
          <div className="topic-filters-container">
            <div className="topic-filters">
              <button 
                className={`topic-chip ${selectedTopicId === "" ? "active" : ""}`}
                onClick={() => setSelectedTopicId("")}
              >
                Tất cả
              </button>
              {topics.map((t) => (
                <button
                  key={t.id}
                  className={`topic-chip ${selectedTopicId === t.id ? "active" : ""}`}
                  onClick={() => setSelectedTopicId(t.id)}
                  style={selectedTopicId === t.id ? { backgroundColor: t.color || '#4f46e5', color: 'white' } : {}}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

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
                <p>{selectedTopicId ? 'Bạn chưa có từ vựng nào trong chủ đề này.' : 'Bạn chưa có từ vựng nào.'}</p>
                <Button size="sm" onClick={() => setIsAdding(true)}>
                  {selectedTopicId ? 'Thêm từ mới' : 'Thêm từ đầu tiên'}
                </Button>
              </div>
            )}
          </main>

          <style>{`
            .topic-filters-container {
              position: relative;
              margin-bottom: 20px;
              padding: 0 10px;
              border-bottom: 1px solid #f1f5f9;
            }
            .topic-filters {
              display: flex;
              gap: 10px;
              overflow-x: auto;
              padding: 8px 0 15px;
              scrollbar-width: none; /* Firefox */
            }
            .topic-filters::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
            .topic-chip {
              padding: 8px 20px;
              border-radius: 20px;
              background: #f1f5f9;
              color: #64748b;
              font-size: 0.85rem;
              font-weight: 600;
              white-space: nowrap;
              cursor: pointer;
              border: 1px solid transparent;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              flex-shrink: 0;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            }
            .topic-chip:hover {
              background: #e2e8f0;
              color: #1e293b;
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            }
            .topic-chip:active {
              transform: translateY(0);
            }
            .topic-chip.active {
              background: #4f46e5;
              color: white;
              box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
              transform: translateY(-1px);
            }
            @media (prefers-color-scheme: dark) {
              .topic-filters-container {
                border-bottom-color: #2e303a;
              }
              .topic-chip {
                background: #1f2028;
                color: #9ca3af;
              }
              .topic-chip:hover {
                background: #2e303a;
                color: #f3f4f6;
              }
              .topic-chip.active {
                background: #c084fc;
                box-shadow: 0 4px 12px rgba(192, 132, 252, 0.3);
              }
            }
          `}</style>
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

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

export default HomePage;
