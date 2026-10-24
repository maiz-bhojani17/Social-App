import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { processUploadedFile } from '../utils/upload.js';

// @desc    Create a new post (Items 8, 13: Post CRUD & Upload image with post)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Post must contain either text content or an image' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await processUploadedFile(req, req.file);
    }

    const post = await Post.create({
      author: req.user._id,
      content: content ? content.trim() : '',
      image: imageUrl,
      likes: [],
      comments: [],
      shares: 0
    });

    // Item 9: Populate user data
    await post.populate('author', 'name username avatar');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feed posts with pagination & user population (Items 8, 9, 21)
// @route   GET /api/posts
// @access  Public / Private
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();

    // Items 9 & 21: Populate author data and paginate
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar isVerified')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 }, limit: 3 },
        populate: { path: 'user', select: 'name username avatar' }
      });

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post with full comments & author (Item 10: Single Post)
// @route   GET /api/posts/:id
// @access  Public
export const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const post = await Post.findById(id)
      .populate('author', 'name username avatar bio isVerified')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'user', select: 'name username avatar' }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get single post error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get posts by a specific user (Item 12: Single Profile Posts & Item 21: Pagination)
// @route   GET /api/posts/user/:userId
// @access  Public
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Resolve userId whether it is an ObjectId or a username
    let authorId = userId;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId.toLowerCase() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      authorId = user._id;
    }

    const totalPosts = await Post.countDocuments({ author: authorId });

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar isVerified')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'user', select: 'name username avatar' }
      });

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a post (Item 8: Post CRUD - Update)
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    if (content !== undefined) post.content = content.trim();

    if (req.file) {
      post.image = await processUploadedFile(req, req.file);
    }

    await post.save();
    await post.populate('author', 'name username avatar');

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a post (Item 8: Post CRUD - Delete)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Cascade delete associated comments
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like or Unlike a post (Item 16: Like)
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.some((likeId) => likeId.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likesCount: post.likes.length,
      likes: post.likes
    });
  } catch (error) {
    console.error('Like toggle error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share a post (Item 15: Share)
// @route   POST /api/posts/:id/share
// @access  Public / Private
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.shares = (post.shares || 0) + 1;
    await post.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const shareUrl = `${clientUrl}/post/${post._id}`;

    return res.status(200).json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: post.shares,
      shareUrl
    });
  } catch (error) {
    console.error('Share post error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a post (Item 20: Comment)
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text: text.trim()
    });

    post.comments.push(comment._id);
    await post.save();

    await comment.populate('user', 'name username avatar');

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment from a post (Item 20: Comment)
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only comment author or post author can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    // Remove from post comments array
    post.comments = post.comments.filter((cId) => cId.toString() !== commentId.toString());
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
