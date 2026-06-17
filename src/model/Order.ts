import { query } from "../database/client";
import { OrderProduct, storeOrderProduct } from "./OrderProduct";

export default interface Order {
    id?: number;
    userId: number;
    status: string;
};

export class OrderStore {
    async getUserOrders(userId: number): Promise<Order[]> {
        try {
            const sql = `
                SELECT id, user_id AS "userId", status 
                FROM Orders 
                WHERE user_id = $1;
            `;
            const result = (await query(sql, [userId])) as Order[];
            return result;
        } catch (err) {
            throw new Error(`Could not get orders for user ${userId}: ${err}`);
        }
    }

    async getCurrentOrderByUser(userId: number): Promise<Order | null> {
        try {
            const sql = `
                SELECT id, user_id AS "userId", status 
                FROM Orders 
                WHERE user_id = $1         AND 
                      status  = 'active';
            `;
            const result = (await query(sql, [userId])) as Order[];
            if (result.length === 0) return null;
            return result[0];
        } catch (err) {
            throw new Error(`Could not get current order for user ${userId}: ${err}`);
        }
    }

    async getCompletedOrdersByUser(userId: number): Promise<Order[]> {
        try {
            const sql = `
                SELECT id, user_id AS "userId", status 
                FROM Orders 
                WHERE user_id = $1         AND 
                      status  = 'complete';
            `;
            const result = (await query(sql, [userId])) as Order[];
            return result;
        } catch (err) {
            throw new Error(`Could not get completed orders for user ${userId}: ${err}`);
        }
    }

    async create(order: Order): Promise<Order> {
        try {
            const sql = `
                INSERT INTO Orders (user_id, status) 
                VALUES ($1, $2) 
                RETURNING id, user_id AS "userId", status;
            `;
            const result = (await query(sql, [order.userId, order.status])) as Order[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not create order: ${err}`);
        }
    }

    async updateOrderStatus(orderId: number, status: string): Promise<Order> {
        try {
            const sql = `
                UPDATE Orders 
                SET status = $1 
                WHERE id = $2 
                RETURNING id, user_id AS "userId", status;
            `;
            const result = (await query(sql, [status, orderId])) as Order[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not update order status: ${err}`);
        }
    }
}

export const storeOrder = new OrderStore();