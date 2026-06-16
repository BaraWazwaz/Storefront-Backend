import { query } from "../database/client";

export default interface Product {
    id?: number;
    name: string;
    price: number;
    category?: string;
};

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            const sql = 'SELECT * FROM Product;';
            const result = await query(sql, []);
            return result.map((row: any) => ({
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                category: row.category
            }));
        } catch (err) {
            throw new Error(`Could not get products: ${err}`);
        }
    }

    async show(id: number): Promise<Product> {
        try {
            const sql = 'SELECT * FROM Product WHERE id = $1;';
            const result = await query(sql, [id]);
            if (result.length === 0) {
                throw new Error(`Product with id ${id} not found`);
            }
            const row = result[0];
            return {
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                category: row.category
            };
        } catch (err) {
            throw new Error(`Could not get product: ${err}`);
        }
    }

    async create(product: Product): Promise<Product> {
        try {
            const { name, price, category } = product;
            const sql = 'INSERT INTO Product (name, price, category) VALUES ($1, $2, $3) RETURNING *;';
            const result = await query(sql, [name, price, category || null]);
            const row = result[0];
            return {
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                category: row.category
            };
        } catch (err) {
            throw new Error(`Could not create product: ${err}`);
        }
    }

    async top5Popular(): Promise<Product[]> {
        try {
            const sql = `
                SELECT p.id, p.name, p.price, p.category
                FROM Product p
                JOIN order_products op ON p.id = op.product_id
                GROUP BY p.id, p.name, p.price, p.category
                ORDER BY SUM(op.quantity) DESC
                LIMIT 5;
            `;
            const result = await query(sql, []);
            return result.map((row: any) => ({
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                category: row.category
            }));
        } catch (err) {
            throw new Error(`Could not get popular products: ${err}`);
        }
    }

    async byCategory(category: string): Promise<Product[]> {
        try {
            const sql = 'SELECT * FROM Product WHERE category = $1;';
            const result = await query(sql, [category]);
            return result.map((row: any) => ({
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                category: row.category
            }));
        } catch (err) {
            throw new Error(`Could not get products by category: ${err}`);
        }
    }
}
