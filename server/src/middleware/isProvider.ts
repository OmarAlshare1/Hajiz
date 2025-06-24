import { Request, Response, NextFunction } from 'express';

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