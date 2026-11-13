import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} fileBuffer - Base64 encoded image or file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImage = async (fileBuffer, folder = 'naira-cardigans') => {
  try {
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Upload multiple images
 * @param {Array<string>} fileBuffers - Array of base64 encoded images
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
export const uploadMultipleImages = async (fileBuffers, folder = 'naira-cardigans') => {
  try {
    const uploadPromises = fileBuffers.map(buffer => uploadImage(buffer, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

export const uploadVideo = async (fileBuffer, folder = 'naira-cardigans/videos') => {
  try {
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder,
      resource_type: 'video',
      chunk_size: 6000000,
      eager: [
        { format: 'mp4', quality: 'auto:good' },
        { format: 'webm', quality: 'auto:good' }
      ],
      eager_async: true
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video to Cloudinary');
  }
};

/**
 * AI Enhance & Polish Image
 * Solves phone camera lighting and color limitations for local creators.
 * Automatically balances exposure, enhances contrast, and sharpens fabric texture.
 */
export const enhanceAndUploadImage = async (fileBuffer, folder = 'naira-cardigans/enhanced') => {
  try {
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { effect: 'improve' },
        { effect: 'auto_color' },
        { effect: 'auto_contrast' },
        { effect: 'sharpen:80' },
        { width: 1200, height: 1500, crop: 'limit' },
        { quality: 'auto:best' }
      ]
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary enhance error:', error);
    throw new Error('Failed to enhance image with Cloudinary AI');
  }
};

/**
 * Generate a slow-drape cinematic motion video loop from a still cardigan photograph.
 * Useful for local producers who only have still photos.
 */
export const generateMotionVideoFromImage = async (fileBuffer, folder = 'naira-cardigans/videos') => {
  try {
    // 1. Upload base image
    const imgUpload = await cloudinary.uploader.upload(fileBuffer, {
      folder: 'naira-cardigans/temp-frames',
      resource_type: 'image',
      transformation: [
        { effect: 'improve' },
        { width: 1080, height: 1350, crop: 'fill' }
      ]
    });

    // 2. Generate smooth cinematic video url with zoom/pan animation
    const videoUrl = cloudinary.url(imgUpload.public_id, {
      resource_type: 'video',
      format: 'mp4',
      transformation: [
        { width: 720, height: 960, crop: 'fill', gravity: 'auto' },
        { effect: 'zoompan:from_(g_north;zoom_1.0):to_(g_center;zoom_1.15):duration_5' },
        { quality: 'auto' }
      ]
    });

    return { url: videoUrl, publicId: imgUpload.public_id };
  } catch (error) {
    console.error('Generate motion video error:', error);
    throw new Error('Failed to generate motion video from image');
  }
};

export default cloudinary;

