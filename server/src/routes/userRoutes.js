import express from 'express';
import {
  getUserProfile,
  editProfile,
  editPassword,
  editAvatar,
  removeAvatar,
  searchAll
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// Search endpoint (Item 14)
router.get('/search', searchAll);

// Profile editing routes (Private)
router.put('/profile', protect, editProfile); // Item 5: edit profile
router.put('/password', protect, editPassword); // Item 6: edit password
router.put('/avatar', protect, upload.single('avatar'), editAvatar); // Item 7: edit picture
router.delete('/avatar', protect, removeAvatar); // Remove picture

// Single profile view (Item 11: single profile)
router.get('/:identifier', getUserProfile);

export default router;
