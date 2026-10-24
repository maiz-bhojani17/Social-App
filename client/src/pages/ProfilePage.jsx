import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { 
  CheckCircle, 
  Settings, 
  Calendar, 
  MessageSquare, 
  Grid, 
  Loader,
  Lock
} from 'lucide-react';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState('info');

  const isOwnProfile =
    currentUser &&
    (currentUser.username?.toLowerCase() === username?.toLowerCase() ||
     currentUser._id === profileUser?._id);

  // Fetch Profile (Item 11: Single Profile)
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${username}`);
      if (res.data.success) {
        setProfileUser(res.data.user);
        if (isAuthenticated) {
          fetchUserPosts(res.data.user._id);
        } else {
          setPostsLoading(false);
        }
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Posts (Item 12: Single Profile Posts)
  const fetchUserPosts = async (userId) => {
    try {
      setPostsLoading(true);
      const res = await api.get(`/posts/user/${userId}`);
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Fetch user posts error:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !profileUser ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)' }}>User not found.</p>
        </div>
      ) : (
        <div>
          {/* Profile Header (Item 11: Single Profile) */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="profile-header-stack" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                <div 
                  onClick={() => {
                    if (isOwnProfile) {
                      setEditModalTab('avatar');
                      setIsEditOpen(true);
                    }
                  }}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-surface-elevated)', 
                    overflow: 'hidden', 
                    border: '3px solid var(--primary)', 
                    flexShrink: 0,
                    cursor: isOwnProfile ? 'pointer' : 'default'
                  }}
                  title={isOwnProfile ? 'Click to change or remove profile picture' : ''}
                >
                  {profileUser.avatar ? (
                    <img src={profileUser.avatar} alt={profileUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '28px', color: 'var(--primary)', fontWeight: '700' }}>
                      {profileUser.name?.[0] || 'U'}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{profileUser.name}</h2>
                    {profileUser.isVerified && (
                      <span className="badge badge-verified">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                    @{profileUser.username}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <Calendar size={13} />
                    <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div>
                {isOwnProfile ? (
                  <button 
                    onClick={() => {
                      setEditModalTab('info');
                      setIsEditOpen(true);
                    }} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '13px', padding: '8px 14px' }}
                  >
                    <Settings size={15} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <Link to={`/chat?user=${profileUser._id}`} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
                    <MessageSquare size={15} />
                    <span>Direct Message</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <p style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                {profileUser.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)' }}>{posts.length}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)', marginLeft: '6px' }}>Posts</span>
              </div>
            </div>
          </div>

          {/* Item 12: Single Profile Posts */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700' }}>
            <Grid size={16} />
            <span>POSTS BY {profileUser.name.toUpperCase()}</span>
          </div>

          {!isAuthenticated ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Lock size={26} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px' }}>Posts are Private</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px' }}>
                @{profileUser.username} ki posts dekhne ke liye pehle Login ya Sign Up karein.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 22px' }}>Log In</Link>
                <Link to="/signup" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 22px' }}>Sign Up</Link>
              </div>
            </div>
          ) : postsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              No posts published yet by this user.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))
          )}

          {/* Edit Profile Modal (Items 5, 6, 7) */}
          <EditProfileModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onProfileUpdated={fetchProfile}
            defaultTab={editModalTab}
          />
        </div>
      )}
    </div>
  );
};
