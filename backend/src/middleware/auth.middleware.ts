import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';  // FIXED: Use correct path (add .model if file is named User.model.ts)

interface JwtPayload {
  userId: string;
  role: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    (req as any).user = user; // Attach user to req (use any for now, or extend Request)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};