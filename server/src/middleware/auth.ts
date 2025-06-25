import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
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

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

export const isProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied. Providers only.' });
    }
    next();
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const generateToken = (userId: string): string => {
  const secret: Secret = process.env.JWT_SECRET || 'default_secret';
  let expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
  // If expiresIn is a number string, convert to number
  if (!isNaN(Number(expiresIn))) {
    expiresIn = Number(expiresIn);
  }
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign({ userId }, secret, options);
};