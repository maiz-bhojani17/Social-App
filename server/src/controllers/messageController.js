import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message (Item 19: Chat App)
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message content are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver user not found' });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim()
    });

    await newMessage.populate('sender', 'name username avatar');
    await newMessage.populate('receiver', 'name username avatar');

    return res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get message history with a specific user (Item 19: Chat App)
// @route   GET /api/messages/:otherUserId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id;

    if (!otherUserId || !otherUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    // Mark unread messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active chat conversations
// @route   GET /api/messages/conversations/all
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    // Filter unique chat partners
    const conversationMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;

      const partner =
        msg.sender._id.toString() === currentUserId.toString()
          ? msg.receiver
          : msg.sender;

      if (!partner || !partner._id) continue;

      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          isUnread: msg.receiver._id.toString() === currentUserId.toString() && !msg.read
        });
      }
    }

    return res.status(200).json({
      success: true,
      conversations: Array.from(conversationMap.values())
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
