import { logger } from '../utils/logger.js';
import imagekit from '../config/imagekit.js';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const result = await imagekit.files.upload({
      file: req.file.buffer,
      fileName: `image-${Date.now()}-${req.file.originalname}`,
      folder: '/uploads'
    });

    res.status(200).json({
      message: 'Image uploaded successfully to ImageKit.',
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      name: result.name,
      size: result.size
    });
  } catch (error) {
    logger.error("ImageKit Upload Error:", { error });
    res.status(500).json({
      message: 'Failed to upload image.'
    });
  }
};

// Multi-image upload handler
// NOTE: 50 MB upload limit per file is an intentional product decision for high-resolution image uploads preserved for ImageKit responsive transformations.
export const uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded.' });
    }
    if (files.length > 4) {
      return res.status(400).json({ message: 'Maximum 4 images allowed per post.' });
    }

    const uploadPromises = files.map(file =>
      imagekit.files.upload({
        file: file.buffer,
        fileName: `image-${Date.now()}-${file.originalname}`,
        folder: '/uploads'
      })
    );

    const results = await Promise.all(uploadPromises);
    const uploadedImages = results.map(r => ({
      url: r.url,
      thumbnailUrl: r.thumbnailUrl || r.url,
      fileId: r.fileId,
      name: r.name,
      size: r.size
    }));

    res.status(200).json({
      message: 'Images uploaded successfully.',
      images: uploadedImages
    });
  } catch (error) {
    logger.error("Multiple ImageKit Upload Error:", { error });
    res.status(500).json({
      message: 'Failed to upload images.'
    });
  }
};
