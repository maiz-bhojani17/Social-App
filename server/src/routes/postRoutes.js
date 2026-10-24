import express from 'express';
import {
  createPost,
  getPosts,
  getSinglePost,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  sharePost,
  addComment,
  deleteComment
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// 1. Post Feed & Creation (Items 8, 9, 13, 21)
router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('image'), createPost);

// 2. User Specific Posts (Item 12: single profile posts & Item 21: pagination)
router.get('/user/:userId', protect, getUserPosts);

// 3. Single Post CRUD (Items 8, 10: single post)
router.route('/:id')
  .get(protect, getSinglePost)
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

// 4. Like / Unlike (Item 16: like)
router.put('/:id/like', protect, toggleLikePost);

// 5. Share post (Item 15: share)
router.post('/:id/share', sharePost);

// 6. Comments (Item 20: comment)
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
