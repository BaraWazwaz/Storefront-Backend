import { ProductStore, ProductWithPopularity } from './Product';
import { storeAppUser } from './AppUser';
import { storeOrder } from './Order';
import { storeOrderProduct } from './OrderProduct';
import client from '../database/client';

const store = new ProductStore();

describe("Product Model", () => {
    let productId: number;

    beforeAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    afterAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    it("should have an index method", () => {
        expect(store.index).toBeDefined();
    });

    it("should have a show method", () => {
        expect(store.show).toBeDefined();
    });

    it("should have a create method", () => {
        expect(store.create).toBeDefined();
    });

    it("should have a byCategory method", () => {
        expect(store.byCategory).toBeDefined();
    });

    it("create method should add a product", async () => {
        const result = await store.create({
            name: "Laptop",
            price: 999.99,
            category: "Electronics"
        });
        expect(result.name).toEqual("Laptop");
        expect(result.price).toEqual(999.99);
        expect(result.category).toEqual("Electronics");
        expect(result.id).toBeDefined();
        if (result.id) {
            productId = result.id;
        }
    });

    it("index method should return a list of products", async () => {
        const result = await store.index();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].name).toEqual("Laptop");
    });

    it("show method should return the correct product", async () => {
        const result = await store.show(productId);
        expect(result.name).toEqual("Laptop");
        expect(result.price).toEqual(999.99);
    });

    it("byCategory method should return products of that category", async () => {
        const result = await store.byCategory("Electronics");
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].name).toEqual("Laptop");
    });

    it("byCategory method should return empty list for unused category", async () => {
        const result = await store.byCategory("Books");
        expect(result.length).toEqual(0);
    });

    describe("top5Popular", () => {
        let uId: number;
        let oId: number;
        let pIds: number[] = [];

        beforeAll(async () => {
            await client.query("DELETE FROM order_products;");
            await client.query("DELETE FROM Orders;");
            await client.query("DELETE FROM Product;");
            await client.query("DELETE FROM AppUser;");

            const user = await storeAppUser.create({
                firstName: "Top5",
                lastName: "User",
                password: "password123"
            });
            uId = user.id!;

            const product = await store.create({
                name: "PopProduct",
                price: 10,
                category: "Gadgets"
            });
            pIds.push(product.id!);

            const order = await storeOrder.create({ userId: uId, status: "active" });
            oId = order.id!;

            await storeOrderProduct.addProductToOrder(oId, pIds[0], 10);
        });

        it("should have a top5Popular method", () => {
            expect(store.top5Popular).toBeDefined();
        });

        it("should return popular products with correct structure and productsCount", async () => {
            const result = await store.top5Popular();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].name).toEqual("PopProduct");
            expect(result[0].productsCount).toEqual(10);
        });
    });
});
