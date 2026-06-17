import { storeOrder } from './Order';
import { storeAppUser } from './AppUser';
import { storeProduct } from './Product';
import client from '../database/client';

describe("Order Model", () => {
    let userId: number;
    let productId: number;
    let orderId: number;

    beforeAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");

        const user = await storeAppUser.create({
            firstName: "Alice",
            lastName: "Smith",
            password: "password123"
        });
        userId = user.id as number;

        const product = await storeProduct.create({
            name: "Mouse",
            price: 25.00,
            category: "Electronics"
        });
        productId = product.id as number;
    });

    afterAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    it("should have getCurrentOrderByUser method", async () => {
        const result = await storeOrder.getCurrentOrderByUser(userId);
        expect(storeOrder.getCurrentOrderByUser).toBeDefined();
    });

    it("should have getCompletedOrdersByUser method", async () => {
        expect(await storeOrder.getCompletedOrdersByUser(userId)).toBeDefined();
    });

    it("should have create method", () => {
        expect(storeOrder.create).toBeDefined();
    });

    it("should have updateOrderStatus method", () => {
        expect(storeOrder.updateOrderStatus).toBeDefined();
    });

    it("create method should add an order", async () => {
        const result = await storeOrder.create({
            userId: userId,
            status: "active"
        });
        expect(result.userId).toEqual(userId);
        expect(result.status).toEqual("active");
        expect(result.id).toBeDefined();
        orderId = result.id!;
    });

    it("currentOrderByUser should return the active order", async () => {
        const result = await storeOrder.getCurrentOrderByUser(userId);
        expect(result).not.toBeNull();
        expect(result!.userId).toEqual(userId);
        expect(result!.status).toEqual("active");
    });

    it("currentOrderByUser should now contain the added product", async () => {
        const result = await storeOrder.getCurrentOrderByUser(userId);
        expect(result).not.toBeNull();
        expect(result!.userId).toEqual(userId);
        expect(result!.status).toEqual("active");
    });

    it("updateOrderStatus should mark the order as complete", async () => {
        const result = await storeOrder.updateOrderStatus(orderId, "complete");
        expect(result.status).toEqual("complete");
    });

    it("completedOrdersByUser should return the completed order", async () => {
        const result = await storeOrder.getCompletedOrdersByUser(userId);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(orderId);
        expect(result[0].status).toEqual("complete");
    });

    it("currentOrderByUser should return null when no active order exists", async () => {
        const result = await storeOrder.getCurrentOrderByUser(userId);
        expect(result).toBeNull();
    });
});
