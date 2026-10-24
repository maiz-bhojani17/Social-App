import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthGuard } from './components/AuthGuard';
import { CreatePostModal } from './components/CreatePostModal';

// Pages
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { SinglePostPage } from './pages/SinglePostPage';
import { ChatPage } from './pages/ChatPage';
import { SearchPage } from './pages/SearchPage';

export function App() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Main Page Area */}
      <main className="main-container">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Main Home Feed (Public) */}
          <Route path="/" element={<FeedPage key={refreshKey} onOpenCreatePost={() => setIsCreatePostOpen(true)} />} />
          
          {/* Post and Profile Views */}
          <Route path="/post/:id" element={<SinglePostPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Protected Routes (Item 4: Auth Guard) */}
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default App;
