import express from 'express';
import { lookbookRepository } from '../repositories/lookbookRepository.js';
import { uploadImage, uploadVideo } from '../services/cloudinary.js';
import { protect } from '../middleware/auth.js';
import { generateLookbookStory } from '../services/aiService.js';

const router = express.Router();

// AI Lookbook Story Generator
router.post('/ai-suggest-story', protect, async (req, res) => {
  try {
    const { productName, category, knitGauge, occasion, imageBase64 } = req.body;
    const story = await generateLookbookStory({ productName, category, knitGauge, occasion, imageBase64 });
    res.json({ success: true, data: story });
  } catch (error) {
    console.error('AI lookbook suggest error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: get all lookbooks
router.get('/', async (req, res) => {
  try {
    const lookbooks = await lookbookRepository.find();
    res.json({ success: true, data: lookbooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: get single lookbook
router.get('/:id', async (req, res) => {
  try {
    const lookbook = await lookbookRepository.findById(req.params.id);
    if (!lookbook) return res.status(404).json({ success: false, message: 'Lookbook not found' });
    res.json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: create lookbook
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, imageBase64, images: incomingImages, taggedProducts, stylingTips } = req.body;
    let images = [];

    // Process multiple images array if provided
    if (incomingImages && Array.isArray(incomingImages) && incomingImages.length > 0) {
      const base64List = [];
      const remoteList = [];

      for (const item of incomingImages) {
        if (typeof item === 'string' && item.startsWith('http')) {
          remoteList.push({ url: item, publicId: '' });
        } else if (typeof item === 'object' && item.url) {
          remoteList.push(item);
        } else if (typeof item === 'string' && item.startsWith('data:image')) {
          base64List.push(item);
        }
      }

      if (base64List.length > 0) {
        const uploaded = await uploadMultipleImages(base64List, 'naira-cardigans/lookbook');
        images = [...remoteList, ...uploaded];
      } else {
        images = remoteList;
      }
    } else if (imageBase64) {
      if (imageBase64.startsWith('http')) {
        images = [{ url: imageBase64, publicId: '' }];
      } else {
        const uploaded = await uploadImage(imageBase64, 'naira-cardigans/lookbook');
        images = [uploaded];
      }
    }

    const imageUrl = images[0]?.url || '';
    const imagePublicId = images[0]?.publicId || '';

    const lookbook = await lookbookRepository.create({ 
      title, 
      description, 
      imageUrl, 
      imagePublicId, 
      images, 
      taggedProducts: taggedProducts || [], 
      stylingTips: stylingTips || [] 
    });
    res.status(201).json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: update lookbook
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, imageBase64, images: incomingImages, taggedProducts, stylingTips } = req.body;
    const updateData = { title, description, taggedProducts, stylingTips };

    if (incomingImages && Array.isArray(incomingImages)) {
      const base64List = [];
      const remoteList = [];

      for (const item of incomingImages) {
        if (typeof item === 'string' && item.startsWith('http')) {
          remoteList.push({ url: item, publicId: '' });
        } else if (typeof item === 'object' && item.url) {
          remoteList.push(item);
        } else if (typeof item === 'string' && item.startsWith('data:image')) {
          base64List.push(item);
        }
      }

      if (base64List.length > 0) {
        const uploaded = await uploadMultipleImages(base64List, 'naira-cardigans/lookbook');
        updateData.images = [...remoteList, ...uploaded];
      } else {
        updateData.images = remoteList;
      }

      if (updateData.images.length > 0) {
        updateData.imageUrl = updateData.images[0].url;
        updateData.imagePublicId = updateData.images[0].publicId || '';
      }
    } else if (imageBase64) {
      if (imageBase64.startsWith('http')) {
        updateData.imageUrl = imageBase64;
        updateData.imagePublicId = '';
        updateData.images = [{ url: imageBase64, publicId: '' }];
      } else {
        const uploaded = await uploadImage(imageBase64, 'naira-cardigans/lookbook');
        updateData.imageUrl = uploaded.url;
        updateData.imagePublicId = uploaded.publicId;
        updateData.images = [uploaded];
      }
    }

    const lookbook = await lookbookRepository.findByIdAndUpdate(req.params.id, updateData);
    if (!lookbook) return res.status(404).json({ success: false, message: 'Lookbook not found' });
    res.json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: delete lookbook
router.delete('/:id', protect, async (req, res) => {
  try {
    const lookbook = await lookbookRepository.findByIdAndDelete(req.params.id);
    if (!lookbook) return res.status(404).json({ success: false, message: 'Lookbook not found' });
    res.json({ success: true, message: 'Lookbook deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
