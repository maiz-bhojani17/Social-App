import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommentsModal } from './CommentsModal';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trash2, 
  CheckCircle, 
  Copy,
  ExternalLink 
} from 'lucide-react';

export const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [sharesCount, setSharesCount] = useState(post.shares || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [copied, setCopied] = useState(false);

  const isLiked = user && likes.some((likeId) => {
    const id = typeof likeId === 'object' ? likeId._id : likeId;
    return id?.toString() === user._id?.toString();
  });

  const isAuthor = user && (post.author?._id?.toString() === user._id?.toString());

  // Item 16: Like Toggle
  const handleLikeToggle = async () => {
    if (!user) return alert('Please login to like posts');
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      if (res.data.success) {
        if (res.data.isLiked) {
          setLikes([...likes, user._id]);
        } else {
          setLikes(likes.filter((id) => (typeof id === 'object' ? id._id : id) !== user._id));
        }
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Item 15: Share Post
  const handleShare = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/share`);
      if (res.data.success) {
        setSharesCount(res.data.sharesCount);
        const postUrl = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Item 8: Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      {/* Header: User data populate (Item 9) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <Link to={`/profile/${post.author?.username}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: '700', color: 'var(--primary)', fontSize: '16px' }}>
                {post.author?.name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>{post.author?.name || 'User'}</span>
              {post.author?.isVerified && (
                <CheckCircle size={14} color="var(--accent-emerald)" />
              )}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              @{post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>

        {isAuthor && (
          <button onClick={handleDeletePost} className="btn-icon btn-danger" style={{ width: '32px', height: '32px' }} title="Delete Post">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: post.image ? '12px' : '16px', wordBreak: 'break-word' }}>
        {post.content}
      </p>

      {/* Uploaded Post Image (Item 13) */}
      {post.image && (
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px', maxHeight: '420px', background: '#000' }}>
          <img src={post.image} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* Actions: Likes, Comments, Share, Single Post Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>
        {/* Item 16: Like */}
        <button
          onClick={handleLikeToggle}
          style={{
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isLiked ? 'var(--accent-rose)' : 'inherit',
            fontWeight: isLiked ? '700' : '500'
          }}
        >
          <Heart size={18} fill={isLiked ? 'var(--accent-rose)' : 'none'} color={isLiked ? 'var(--accent-rose)' : 'currentColor'} />
          <span>{likes.length} Likes</span>
        </button>

        {/* Item 20: Comments */}
        <button
          onClick={() => setIsCommentsOpen(true)}
          style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit' }}
        >
          <MessageCircle size={18} />
          <span>{commentsCount} Comments</span>
        </button>

        {/* Item 15: Share */}
        <button
          onClick={handleShare}
          style={{
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: copied ? 'var(--accent-emerald)' : 'inherit'
          }}
          title="Share & Copy link"
        >
          {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
          <span>{copied ? 'Link Copied!' : `${sharesCount} Shares`}</span>
        </button>

        {/* Item 10: Single Post Link */}
        <Link to={`/post/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)' }} title="View single post">
          <ExternalLink size={16} />
        </Link>
      </div>

      {/* Comments Modal (Item 20) */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        post={post}
        onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
        onCommentDeleted={() => setCommentsCount((prev) => Math.max(0, prev - 1))}
      />
    </div>
  );
};
