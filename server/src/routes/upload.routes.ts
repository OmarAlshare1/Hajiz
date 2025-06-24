import express from 'express';
import { auth, isProvider } from '../middleware/auth';
import { uploadProviderImages, deleteProviderImage } from '../controllers/upload.controller';
import { upload } from '../config/cloudinary';

const router = express.Router();

// Upload provider images route
router.post('/provider/images', auth, isProvider, upload.array('images', 5), uploadProviderImages);

// Delete provider image route
router.delete('/provider/images', auth, isProvider, deleteProviderImage);

export default router;