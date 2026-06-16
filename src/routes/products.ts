import { Router, Request, Response } from 'express';
import { ProductStore } from '../model/Product';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();
const store = new ProductStore();

router.get('/', async (req: Request, res: Response) => {
    try {
        const products = await store.index();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/popular', async (req: Request, res: Response) => {
    try {
        const products = await store.top5Popular();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/category/:category', async (req: Request, res: Response) => {
    try {
        const category = req.params.category as string;
        const products = await store.byCategory(category);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid product ID' });
            return;
        }
        const product = await store.show(id);
        res.json(product);
    } catch (err) {
        res.status(404).json({ error: (err as Error).message });
    }
});

router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const { name, price, category } = req.body;
        if (!name || price === undefined) {
            res.status(400).json({ error: 'name and price are required' });
            return;
        }
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            res.status(400).json({ error: 'price must be a valid number' });
            return;
        }
        const product = await store.create({ name, price: numericPrice, category });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;
