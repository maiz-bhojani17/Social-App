import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Send, Trash2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommentsModal = ({ isOpen, onClose, post, onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(post?.comments || []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !post) return null;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      const res = await api.post(`/posts/${post._id}/comments`, { text: text.trim() });
      if (res.data.success) {
        const newComments = [res.data.comment, ...comments];
        setComments(newComments);
        setText('');
        if (onCommentAdded) onCommentAdded(res.data.comment);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/posts/${post._id}/comments/${commentId}`);
      if (res.data.success) {
        const updated = comments.filter((c) => c._id !== commentId);
        setComments(updated);
        if (onCommentDeleted) onCommentDeleted(commentId);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '700' }}>
            <MessageCircle size={18} color="var(--primary)" />
            Comments ({comments.length})
          </h3>
          <button onClick={onClose} className="btn-icon btn-secondary" style={{ width: '30px', height: '30px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Comment list */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px', margin: '30px 0' }}>
              No comments yet. Be the first to start the conversation!
            </p>
          ) : (
            comments.map((comment) => {
              const canDelete =
                user &&
                (user._id === comment.user?._id || user._id === post.author?._id);

              return (
                <div key={comment._id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Link to={`/profile/${comment.user?.username}`}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                      {comment.user?.avatar ? (
                        <img src={comment.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: '700', color: 'var(--primary)' }}>
                          {comment.user?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div style={{ flex: 1, background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Link to={`/profile/${comment.user?.username}`} style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {comment.user?.name || 'User'}
                      </Link>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ background: 'transparent', color: 'var(--text-dim)', padding: 0 }}
                          title="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment input */}
        {user ? (
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ flex: 1, height: '40px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '40px', padding: '0 16px' }}>
              <Send size={16} />
            </button>
          </form>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)' }}>
            Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>log in</Link> to join the discussion.
          </p>
        )}
      </div>
    </div>
  );
};
