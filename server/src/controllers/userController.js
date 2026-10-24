import User from '../models/User.js';
import Post from '../models/Post.js';
import { processUploadedFile } from '../utils/upload.js';

// @desc    Get user profile by ID or username (Item 11: Single Profile)
// @route   GET /api/users/:identifier
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { identifier } = req.params;

    let user;
    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select('-password');
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Count user posts
    const postCount = await Post.countDocuments({ author: user._id });

    return res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        postCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit user profile (Item 5: Edit Profile)
// @route   PUT /api/users/profile
// @access  Private
export const editProfile = async (req, res) => {
  try {
    const { name, bio, username } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username && username.toLowerCase() !== user.username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Edit profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit user password (Item 6: Edit Password)
// @route   PUT /api/users/password
// @access  Private
export const editPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Edit password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit user profile picture (Item 7: Edit Picture)
// @route   PUT /api/users/avatar
// @access  Private
export const editAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const avatarUrl = await processUploadedFile(req, req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      avatar: avatarUrl,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Edit avatar error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove user profile picture (Set avatar to empty)
// @route   DELETE /api/users/avatar
// @access  Private
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
      avatar: '',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: '',
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Remove avatar error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users and posts (Item 14: Search)
// @route   GET /api/users/search
// @access  Public
export const searchAll = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';

    if (!q) {
      return res.status(200).json({ success: true, users: [], posts: [] });
    }

    const regex = new RegExp(q, 'i');

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }]
    })
      .select('name username avatar bio isVerified')
      .limit(10);

    const posts = await Post.find({
      content: regex
    })
      .populate('author', 'name username avatar')
      .limit(10);

    return res.status(200).json({
      success: true,
      users,
      posts
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
