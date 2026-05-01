import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../Button/Button';

interface FormData {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

interface FlashcardFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Lưu',
  loading = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: initialData || {
      word: '',
      phonetic: '',
      meaning: '',
      example: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <form className="flashcard-form" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="form-group">
        <label>Từ vựng (Tiếng Anh) <span className="required-mark">*</span></label>
        <input 
          {...register('word', { required: 'Vui lòng nhập từ vựng' })}
          placeholder="e.g. Persistence" 
          className={`form-input ${errors.word ? 'error' : ''}`}
        />
        {errors.word && <span className="form-error">{errors.word.message}</span>}
      </div>
      
      <div className="form-group">
        <label>Phiên âm</label>
        <input 
          {...register('phonetic')}
          placeholder="e.g. /pəˈsɪstəns/" 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Nghĩa (Tiếng Việt) <span className="required-mark">*</span></label>
        <input 
          {...register('meaning', { required: 'Vui lòng nhập ý nghĩa' })}
          placeholder="e.g. Sự kiên trì" 
          className={`form-input ${errors.meaning ? 'error' : ''}`}
        />
        {errors.meaning && <span className="form-error">{errors.meaning.message}</span>}
      </div>

      <div className="form-group">
        <label>Ví dụ minh họa</label>
        <textarea 
          {...register('example')}
          placeholder="e.g. Her persistence paid off in the end." 
          className="form-input"
          rows={3}
          style={{ resize: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <Button 
          type="submit"
          disabled={loading || !isValid} 
          style={{ flex: 1 }}
        >
          {loading ? 'Đang xử lý...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Hủy</Button>
      </div>

      <style>{`
        .flashcard-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .required-mark {
          color: #ef4444;
          margin-left: 2px;
        }
        .form-input {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.95rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        .form-input.error {
          border-color: #ef4444;
        }
        .form-error {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 500;
        }
      `}</style>
    </form>
  );
};

export default FlashcardForm;
