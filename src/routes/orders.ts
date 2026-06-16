import { Router, Request, Response } from 'express';
import { OrderStore } from '../model/Order';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();
const store = new OrderStore();

router.get('/current/:userId', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const order = await store.currentOrderByUser(userId);
        if (!order) {
            res.status(404).json({ error: 'No active order found for user' });
            return;
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/completed/:userId', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const orders = await store.completedOrdersByUser(userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const order = await store.create({ userId: parseInt(userId, 10), status: status || 'active' });
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.post('/:id/products', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.id as string, 10);
        const { productId, quantity } = req.body;

        if (isNaN(orderId)) {
            res.status(400).json({ error: 'Invalid order ID' });
            return;
        }
        if (!productId || !quantity) {
            res.status(400).json({ error: 'productId and quantity are required' });
            return;
        }
        
        const addedProduct = await store.addProductToOrder(
            orderId,
            parseInt(productId, 10),
            parseInt(quantity, 10)
        );
        res.status(201).json(addedProduct);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.put('/:id/status', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.id as string, 10);
        const { status } = req.body;

        if (isNaN(orderId)) {
            res.status(400).json({ error: 'Invalid order ID' });
            return;
        }
        if (!status) {
            res.status(400).json({ error: 'status is required' });
            return;
        }
        
        const updatedOrder = await store.updateOrderStatus(orderId, status);
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
