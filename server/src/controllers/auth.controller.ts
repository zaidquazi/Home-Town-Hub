import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { AppError } from '../middlewares/error-handler.middleware';
import crypto from 'crypto';
import { RefreshToken } from '../models/RefreshToken.model';

const signToken = (id: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as any });
};

const createSendToken = async (user: any, statusCode: number, res: Response, req?: Request) => {
  const accessToken = signToken(user._id.toString(), env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const refreshToken = signToken(user._id.toString(), env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_EXPIRES_IN);

  // Hash refresh token for DB storage
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Store refresh token in database
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    userAgent: req?.headers['user-agent'],
    ipAddress: req?.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Send refresh token in HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      accessToken,
      user
    }
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, username, email, password, hometown, currentLocation, bio } = req.body;

    // Sanitize to prevent NoSQL injection
    const safeEmail = String(email).toLowerCase();
    const safeUsername = String(username).toLowerCase();

    const existingUser = await User.findOne({ $or: [{ email: safeEmail }, { username: safeUsername }] });
    if (existingUser) {
      return next(new AppError('User with this email or username already exists', 400));
    }

    const newUser = await User.create({
      fullName: String(fullName),
      username: safeUsername,
      email: safeEmail,
      password: String(password),
      hometown,
      currentLocation,
      bio: bio ? String(bio) : undefined,
    });

    await createSendToken(newUser, 201, res, req);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const safeEmail = String(email).toLowerCase().trim();
    const safeUsername = String(email).toLowerCase().trim();
    
    const user = await User.findOne({ 
      $or: [{ email: safeEmail }, { username: safeUsername }] 
    }).select('+password');
    
    console.log('[DEBUG LOGIN] searching for:', safeEmail);
    console.log('[DEBUG LOGIN] user found:', !!user);

    if (!user) {
      return next(new AppError('Incorrect email or password (user not found)', 401));
    }

    const isMatch = await user.comparePassword(String(password));
    console.log('[DEBUG LOGIN] password match:', isMatch);

    if (!isMatch) {
      return next(new AppError('Incorrect email or password (wrong password)', 401));
    }

    await createSendToken(user, 200, res, req);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError('No refresh token found. Please log in again.', 401));
    }

    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { id: string };
    
    // Verify token exists in database (hasn't been revoked)
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await RefreshToken.findOne({ tokenHash });
    
    if (!storedToken) {
      return next(new AppError('Session expired or revoked. Please log in again.', 401));
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    const accessToken = signToken(currentUser._id.toString(), env.JWT_SECRET, env.JWT_EXPIRES_IN);

    currentUser.password = undefined;

    res.status(200).json({
      status: 'success',
      data: { 
        accessToken,
        user: currentUser
      }
    });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshToken.deleteOne({ tokenHash });
    } catch { /* ignore */ }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  res.status(200).json({ status: 'success' });
};
