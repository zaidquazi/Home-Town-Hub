import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/error-handler.middleware';
import cloudinary from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file.', 400));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'hometown_hub' },
      (error, result) => {
        if (error) {
          return next(new AppError('Image upload failed', 500));
        }
        res.status(200).json({
          status: 'success',
          data: {
            url: result?.secure_url
          }
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};
