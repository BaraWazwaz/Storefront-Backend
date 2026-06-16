import { query } from "../database/client";

export interface OrderProduct {
    productId: number;
    quantity: number;
    name?: string;
    price?: number;
}

export default interface Order {
    id?: number;
    userId: number;
    status: string; // 'active' or 'complete'
    products?: OrderProduct[];
};

export class OrderStore {
    async currentOrderByUser(userId: number): Promise<Order | null> {
        try {
            const sql = "SELECT * FROM Orders WHERE user_id = $1 AND status = 'active';";
            const result = await query(sql, [userId]);
            if (result.length === 0) {
                return null;
            }
            const orderRow = result[0];
            const orderId = orderRow.id;
            
            const productsSql = `
                SELECT op.product_id, op.quantity, p.name, p.price, p.category
                FROM order_products op
                JOIN Product p ON op.product_id = p.id
                WHERE op.order_id = $1;
            `;
            const productsResult = await query(productsSql, [orderId]);
            
            return {
                id: orderId,
                userId: orderRow.user_id,
                status: orderRow.status,
                products: productsResult.map((p: any) => ({
                    productId: p.product_id,
                    quantity: p.quantity,
                    name: p.name,
                    price: parseFloat(p.price)
                }))
            };
        } catch (err) {
            throw new Error(`Could not get current order for user ${userId}: ${err}`);
        }
    }

    async completedOrdersByUser(userId: number): Promise<Order[]> {
        try {
            const sql = "SELECT * FROM Orders WHERE user_id = $1 AND status = 'complete';";
            const ordersResult = await query(sql, [userId]);
            
            const orders: Order[] = [];
            for (const orderRow of ordersResult) {
                const orderId = orderRow.id;
                const productsSql = `
                    SELECT op.product_id, op.quantity, p.name, p.price, p.category
                    FROM order_products op
                    JOIN Product p ON op.product_id = p.id
                    WHERE op.order_id = $1;
                `;
                const productsResult = await query(productsSql, [orderId]);
                
                orders.push({
                    id: orderId,
                    userId: orderRow.user_id,
                    status: orderRow.status,
                    products: productsResult.map((p: any) => ({
                        productId: p.product_id,
                        quantity: p.quantity,
                        name: p.name,
                        price: parseFloat(p.price)
                    }))
                });
            }
            return orders;
        } catch (err) {
            throw new Error(`Could not get completed orders for user ${userId}: ${err}`);
        }
    }

    async create(order: Order): Promise<Order> {
        try {
            const sql = 'INSERT INTO Orders (user_id, status) VALUES ($1, $2) RETURNING *;';
            const result = await query(sql, [order.userId, order.status || 'active']);
            const row = result[0];
            return {
                id: row.id,
                userId: row.user_id,
                status: row.status,
                products: []
            };
        } catch (err) {
            throw new Error(`Could not create order: ${err}`);
        }
    }

    async addProductToOrder(orderId: number, productId: number, quantity: number): Promise<{ id: number, orderId: number, productId: number, quantity: number }> {
        try {
            const orderSql = 'SELECT * FROM Orders WHERE id = $1;';
            const orderResult = await query(orderSql, [orderId]);
            if (orderResult.length === 0) {
                throw new Error(`Order ${orderId} does not exist`);
            }
            if (orderResult[0].status !== 'active') {
                throw new Error(`Order ${orderId} is not active`);
            }
            
            const productSql = 'SELECT * FROM Product WHERE id = $1;';
            const productResult = await query(productSql, [productId]);
            if (productResult.length === 0) {
                throw new Error(`Product ${productId} does not exist`);
            }
            
            const sql = 'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *;';
            const result = await query(sql, [orderId, productId, quantity]);
            const row = result[0];
            return {
                id: row.id,
                orderId: row.order_id,
                productId: row.product_id,
                quantity: row.quantity
            };
        } catch (err) {
            throw new Error(`Could not add product ${productId} to order ${orderId}: ${err}`);
        }
    }

    async updateOrderStatus(orderId: number, status: string): Promise<Order> {
        try {
            const sql = 'UPDATE Orders SET status = $1 WHERE id = $2 RETURNING *;';
            const result = await query(sql, [status, orderId]);
            if (result.length === 0) {
                throw new Error(`Order ${orderId} not found`);
            }
            const row = result[0];
            return {
                id: row.id,
                userId: row.user_id,
                status: row.status
            };
        } catch (err) {
            throw new Error(`Could not update order status: ${err}`);
        }
    }
}
