import { Router, Request, Response } from 'express';
import { storeOrder } from '../model/Order';
import { storeOrderProduct } from '../model/OrderProduct';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

router.get('/current/:userId', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const order = await storeOrder.getCurrentOrderByUser(userId);
        if (!order) {
            res.status(404).json({ error: 'No active order found for user' });
            return;
        }
        const products = await storeOrderProduct.getOrderProducts(order.id!);
        res.json({ ...order, products });
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
        const orders = await storeOrder.getCompletedOrdersByUser(userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.body;
        if (!userId && userId !== 0) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const numericUserId = typeof userId === 'number' ? userId : parseInt(userId, 10);
        const order = await storeOrder.create({ userId: numericUserId, status: status || 'active' });
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
        if (productId === undefined || productId === null || quantity === undefined || quantity === null) {
            res.status(400).json({ error: 'productId and quantity are required' });
            return;
        }
        
        const numericProductId = typeof productId === 'number' ? productId : parseInt(productId, 10);
        const numericQuantity = typeof quantity === 'number' ? quantity : parseInt(quantity, 10);
        
        const addedProduct = await storeOrderProduct.addProductToOrder(
            orderId,
            numericProductId,
            numericQuantity
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
        
        const updatedOrder = await storeOrder.updateOrderStatus(orderId, status);
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
