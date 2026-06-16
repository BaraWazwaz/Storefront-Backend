import { Router, Request, Response } from 'express';
import AppUser, { AppUserStore } from '../model/AppUser';
import { verifyAuthToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import env from '../env';

// mission: move all routing logic to functions, and pass those functions as parameters to routers

const router = Router();
const store = new AppUserStore();
const JWT_SECRET = env.JWT_SECRET as string;

function generateToken(user: AppUser): string {
    return jwt.sign(
        { id: user.id, firstName: user.firstName, lastName: user.lastName },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

router.get('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const users = await store.index();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const user = await store.show(id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: (err as Error).message });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, password } = req.body;
        if (!firstName || !lastName || !password) {
            res.status(400).json({ error: 'firstName, lastName, and password are required' });
            return;
        }
        const user = await store.create({ firstName, lastName, password });
        const token = generateToken(user);
        res.status(201).json({ user, token });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, password } = req.body;
        if (!firstName || !lastName || !password) {
            res.status(400).json({ error: 'firstName, lastName, and password are required' });
            return;
        }
        const user = await store.authenticate(firstName, lastName, password);
        if (!user) {
            res.status(401).json({ error: 'Invalid user credentials' });
            return;
        }
        const token = generateToken(user);
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;