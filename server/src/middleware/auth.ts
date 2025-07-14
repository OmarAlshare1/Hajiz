import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');

    if (!token || token.length < 10) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'hajiz-api',
      audience: 'hajiz-client'
    }) as JwtPayload;
    
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const isProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'provider') {
      res.status(403).json({ message: 'Access denied. Providers only.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: 'Access denied. Administrators only.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret || secret === 'default_secret' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  
  let expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
  // If expiresIn is a number string, convert to number
  if (!isNaN(Number(expiresIn))) {
    expiresIn = Number(expiresIn);
  }
  
  const options: SignOptions = { 
    expiresIn: expiresIn as any,
    algorithm: 'HS256',
    issuer: 'hajiz-api',
    audience: 'hajiz-client'
  };
  
  return jwt.sign({ userId, iat: Math.floor(Date.now() / 1000) }, secret, options);
};