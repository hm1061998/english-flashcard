import React, { useState } from 'react';
import './Flashcard.less';

interface FlashcardProps {
  word: string;
  phonetic: string;
  meaning: string;
  example?: string;
  displayConfig?: {
    showWord?: boolean;
    showMeaning?: boolean;
    showExample?: boolean;
    showPhonetic?: boolean;
  };
  onFeedback?: (level: 'easy' | 'medium' | 'hard') => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  word, 
  phonetic, 
  meaning, 
  example, 
  displayConfig = { showWord: true, showMeaning: true, showExample: true, showPhonetic: false },
  onFeedback
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping the card when clicking the speaker
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ phát âm thanh.');
    }
  };

  return (
    <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
      <div className="flashcard-inner">
        {/* Front Side */}
        <div className="flashcard-front">
          <button 
            className="speaker-btn" 
            onClick={handleSpeak}
            title="Nghe phát âm"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
            </svg>
          </button>
          <h2 className="flashcard-word">{word}</h2>
          <p className="flashcard-phonetic">{phonetic}</p>
          <span className="hint">Chạm để xem nghĩa</span>
        </div>

        {/* Back Side */}
        <div className="flashcard-back">
          {displayConfig.showWord && <h2 className="flashcard-word" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{word}</h2>}
          {displayConfig.showPhonetic && <p className="flashcard-phonetic" style={{ marginBottom: '15px' }}>{phonetic}</p>}
          
          {displayConfig.showMeaning && (
            <>
              <h3 className="meaning-title">Nghĩa của từ</h3>
              <p className="flashcard-meaning">{meaning}</p>
            </>
          )}

          {displayConfig.showExample && example && (
            <div className="example-box">
              <span className="example-label">Ví dụ:</span>
              <p className="flashcard-example">"{example}"</p>
            </div>
          )}

          <div className="feedback-actions">
            <button className="fb-btn hard" onClick={(e) => { e.stopPropagation(); onFeedback?.('hard'); setIsFlipped(false); }}>Khó</button>
            <button className="fb-btn medium" onClick={(e) => { e.stopPropagation(); onFeedback?.('medium'); setIsFlipped(false); }}>Bình thường</button>
            <button className="fb-btn easy" onClick={(e) => { e.stopPropagation(); onFeedback?.('easy'); setIsFlipped(false); }}>Dễ</button>
          </div>
          
          <span className="hint">Chạm để quay lại</span>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
