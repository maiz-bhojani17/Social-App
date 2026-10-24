import React, { useState } from 'react';
import api from '../services/api';
import { X, Image as ImageIcon, Sparkles, Loader } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      setError('Please add text content or an image');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/posts', formData);

      if (res.data.success) {
        setContent('');
        setImageFile(null);
        setImagePreview('');
        if (onPostCreated) onPostCreated(res.data.post);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '700' }}>
            <Sparkles size={18} color="var(--primary)" />
            Create New Post
          </h3>
          <button onClick={onClose} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="What's happening in your world?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{ width: '100%', resize: 'none', marginBottom: '14px', lineHeight: '1.6' }}
          />

          {imagePreview && (
            <div style={{ position: 'relative', marginBottom: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={removeImage}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--primary)', fontSize: '14px', fontWeight: '600' }}>
              <ImageIcon size={18} />
              <span>Attach Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '100px' }}
            >
              {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
