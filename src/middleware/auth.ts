import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../env';

const JWT_SECRET = env.JWT_SECRET || 'shopping_storefront_secret';

export interface CustomRequest extends Request {
    user?: any;
}

export function verifyAuthToken(req: CustomRequest, res: Response, next: NextFunction): void {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            res.status(401).json({ error: 'Access denied, token missing' });
            return;
        }
        
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Access denied, malformed token' });
            return;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Access denied, invalid token' });
        return;
    }
}
