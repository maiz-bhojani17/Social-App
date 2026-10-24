import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, MessageSquare, ArrowLeft, Loader, Circle } from 'lucide-react';

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch all recent conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations/all');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // If URL has ?user=userId, open that user's chat
  useEffect(() => {
    if (targetUserId) {
      const loadTargetUser = async () => {
        try {
          const res = await api.get(`/users/${targetUserId}`);
          if (res.data.success) {
            setActivePartner(res.data.user);
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadTargetUser();
    }
  }, [targetUserId]);

  // Load message history when activePartner changes
  useEffect(() => {
    if (!activePartner) return;

    const fetchMessages = async () => {
      try {
        setLoadingHistory(true);
        const res = await api.get(`/messages/${activePartner._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchMessages();
  }, [activePartner]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket.io real-time message listener (Item 19)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incomingMsg) => {
      if (activePartner && (incomingMsg.sender?._id === activePartner._id || incomingMsg.sender === activePartner._id)) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
      fetchConversations();
    };

    const handleUserTyping = ({ senderId }) => {
      if (activePartner && senderId === activePartner._id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ senderId }) => {
      if (activePartner && senderId === activePartner._id) {
        setIsTyping(false);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [socket, activePartner]);

  // Handle typing input
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (socket && activePartner) {
      socket.emit('typing', { receiverId: activePartner._id, username: user.username });
      setTimeout(() => {
        socket.emit('stopTyping', { receiverId: activePartner._id });
      }, 2000);
    }
  };

  // Send Message (Item 19)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;

    const messageText = text.trim();
    setText('');

    try {
      const res = await api.post('/messages', {
        receiverId: activePartner._id,
        message: messageText
      });

      if (res.data.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);

        if (socket) {
          socket.emit('sendMessage', {
            ...newMsg,
            receiverId: activePartner._id
          });
        }

        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="glass-panel chat-container" style={{ height: '78vh', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar: Conversations & Active users */}
      <div
        className={`chat-sidebar ${activePartner ? 'hide-mobile' : ''}`}
        style={{ width: '320px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Messages</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No chats yet. Search for a user or visit a profile to start a conversation!
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = conv.user;
              const isSelected = activePartner?._id === partner._id;
              const isOnline = onlineUsers.includes(partner._id);

              return (
                <div
                  key={partner._id}
                  onClick={() => setActivePartner(partner)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-input)', overflow: 'hidden', flexShrink: 0 }}>
                    {partner.avatar ? (
                      <img src={partner.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: '700', color: 'var(--primary)' }}>
                        {partner.name?.[0] || 'U'}
                      </div>
                    )}
                    {isOnline && (
                      <Circle size={10} fill="var(--accent-emerald)" color="var(--accent-emerald)" style={{ position: 'absolute', bottom: 1, right: 1 }} />
                    )}
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {partner.name}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {conv.lastMessage || 'Active conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`chat-main ${!activePartner ? 'hide-mobile' : ''}`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}
      >
        {activePartner ? (
          <>
            {/* Header with Mobile Back Button */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setActivePartner(null)}
                className="btn-icon btn-secondary"
                style={{ width: '32px', height: '32px' }}
                title="Back to conversations"
              >
                <ArrowLeft size={16} />
              </button>

              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', overflow: 'hidden', flexShrink: 0 }}>
                {activePartner.avatar ? (
                  <img src={activePartner.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: '700', color: 'var(--primary)' }}>
                    {activePartner.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{activePartner.name}</h4>
                <span style={{ fontSize: '12px', color: onlineUsers.includes(activePartner._id) ? 'var(--accent-emerald)' : 'var(--text-dim)' }}>
                  {onlineUsers.includes(activePartner._id) ? '● Online' : `@${activePartner.username}`}
                </span>
              </div>
            </div>

            {/* Message History */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingHistory ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto' }}>
                  <Loader size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-dim)', fontSize: '13px' }}>
                  Say hello to {activePartner.name} 👋
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = (msg.sender?._id || msg.sender) === user._id;

                  return (
                    <div
                      key={msg._id || i}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isMine ? 'linear-gradient(135deg, var(--primary), #818cf8)' : 'var(--bg-surface-elevated)',
                        color: '#fff',
                        fontSize: '14px',
                        boxShadow: 'var(--shadow-sm)',
                        wordBreak: 'break-word'
                      }}
                    >
                      <p>{msg.message}</p>
                      <span style={{ display: 'block', fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.75 }}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  {activePartner.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={`Message @${activePartner.username}...`}
                value={text}
                onChange={handleInputChange}
                style={{ flex: 1, height: '40px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ height: '40px', padding: '0 16px' }}>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', padding: '20px' }}>
            <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', textAlign: 'center' }}>Select a conversation from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
