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

export default cloudinary;

