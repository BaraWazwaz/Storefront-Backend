import { query } from "../database/client";

export default interface Product {
    id?: number;
    name: string;
    price: number;
    category?: string;
};

export interface ProductWithPopularity extends Product {
    productsCount: number;
};

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            const sql = `
                SELECT id, name, price, category 
                FROM Product;
            `;
            const result = (await query(sql, [])) as Product[];
            return result;
        } catch (err) {
            throw new Error(`Could not get products: ${err}`);
        }
    }

    async show(id: number): Promise<Product> {
        try {
            const sql = `
                SELECT id, name, price, category 
                FROM Product 
                WHERE id = $1;
            `;
            const result = (await query(sql, [id])) as Product[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not get product: ${err}`);
        }
    }

    async create(product: Product): Promise<Product> {
        try {
            const { name, price, category } = product;
            const sql = `
                INSERT INTO Product (name, price, category) 
                VALUES ($1, $2, $3) 
                RETURNING id, name, price, category;
            `;
            const result = (await query(sql, [name, price, category])) as Product[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not create product: ${err}`);
        }
    }

    async byCategory(category: string): Promise<Product[]> {
        try {
            const sql = `
                SELECT id, name, price, category 
                FROM Product 
                WHERE category = $1;
            `;
            const result = (await query(sql, [category])) as Product[];
            return result;
        } catch (err) {
            throw new Error(`Could not get products by category: ${err}`);
        }
    }

    async top5Popular(): Promise<ProductWithPopularity[]> {
        try {
            const sql = `
                SELECT
                    op.product_id             AS "productId",
                    p.name                    AS name,
                    p.price                   AS price,
                    p.category                AS category,
                    SUM(op.quantity)::integer AS "productsCount"
                FROM order_products op
                JOIN Product p ON op.product_id = p.id
                GROUP BY op.product_id, p.name, p.price, p.category
                ORDER BY "productsCount" DESC
                LIMIT 5;
            `;
            interface DbProductPopularity {
                productId: number;
                name: string;
                price: string | number;
                category: string | null;
                productsCount: number;
            }
            const result = (await query(sql, [])) as DbProductPopularity[];
            return result.map((row: DbProductPopularity) => ({
                id: row.productId,
                name: row.name,
                price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
                category: row.category || undefined,
                productsCount: row.productsCount
            }));
        } catch (err) {
            throw new Error(`Could not get top 5 popular products: ${err}`);
        }
    }
}

export const storeProduct = new ProductStore();