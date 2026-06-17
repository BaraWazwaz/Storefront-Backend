import { query } from "../database/client";
import { ProductWithPopularity, storeProduct } from "./Product";

export interface OrderProduct {
    orderId: number;
    productId: number;
    quantity: number;
    
    userId?: number;
    status?: string;

    name?: string;
    price?: number;
    category?: string;
}

export class OrderProductStore {
    async getOrderProducts(orderId: number): Promise<OrderProduct[]> {
        try {
            const sql = `
                SELECT
                    op.order_id   AS "orderId",
                    op.product_id AS "productId",
                    op.quantity   AS quantity,
                    p.name        AS name,
                    p.price       AS price,
                    p.category    AS category
                FROM order_products op
                JOIN Product p ON op.product_id = p.id
                WHERE op.order_id = $1;
            `;
            const productsResult = (await query(sql, [orderId])) as OrderProduct[];
            return productsResult;
        } catch (err) {
            throw new Error(`Could not get products in order ${orderId}: ${err}`);
        }
    }

    async getTop5PopularProducts(): Promise<ProductWithPopularity[]> {
        return storeProduct.top5Popular();
    }

    async addProductToOrder(orderId: number, productId: number, quantity: number): Promise<OrderProduct> {
        try {
            const sql = `
                INSERT INTO order_products (order_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING order_id AS "orderId", product_id AS "productId", quantity;
            `;
            const result = (await query(sql, [orderId, productId, quantity])) as OrderProduct[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not add product ${productId} to order ${orderId}: ${err}`);
        }
    }

    async updateProductQuantityInOrder(orderId: number, productId: number, quantity: number): Promise<OrderProduct> {
        try {
            const sql = `
                UPDATE order_products
                SET quantity = $1
                WHERE
                    order_id   = $2 AND 
                    product_id = $3
                RETURNING order_id AS "orderId", product_id AS "productId", quantity;
            `;
            const result = (await query(sql, [quantity, orderId, productId])) as OrderProduct[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not update product ${productId} quantity in order ${orderId}: ${err}`);
        }
    }

    async deleteProductFromOrder(orderId: number, productId: number): Promise<void> {
        try {
            const sql = `
                DELETE FROM order_products
                WHERE
                    order_id   = $1 AND 
                    product_id = $2;
            `;
            await query(sql, [orderId, productId]);
        } catch (err) {
            throw new Error(`Could not delete product ${productId} from order ${orderId}: ${err}`);
        }
    }
}

export const storeOrderProduct = new OrderProductStore();