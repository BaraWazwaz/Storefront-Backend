import { OrderStore } from './Order';
import { AppUserStore } from './AppUser';
import { ProductStore } from './Product';
import client from '../database/client';

const orderStore = new OrderStore();
const userStore = new AppUserStore();
const productStore = new ProductStore();

describe("Order Model", () => {
    let userId: number;
    let productId: number;
    let orderId: number;

    beforeAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");

        const user = await userStore.create({
            firstName: "Alice",
            lastName: "Smith",
            password: "password123"
        });
        userId = user.id!;

        const product = await productStore.create({
            name: "Mouse",
            price: 25.00,
            category: "Electronics"
        });
        productId = product.id!;
    });

    afterAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    it("should have currentOrderByUser method", () => {
        expect(orderStore.currentOrderByUser).toBeDefined();
    });

    it("should have completedOrdersByUser method", () => {
        expect(orderStore.completedOrdersByUser).toBeDefined();
    });

    it("should have create method", () => {
        expect(orderStore.create).toBeDefined();
    });

    it("should have addProductToOrder method", () => {
        expect(orderStore.addProductToOrder).toBeDefined();
    });

    it("should have updateOrderStatus method", () => {
        expect(orderStore.updateOrderStatus).toBeDefined();
    });

    it("create method should add an order", async () => {
        const result = await orderStore.create({
            userId: userId,
            status: "active"
        });
        expect(result.userId).toEqual(userId);
        expect(result.status).toEqual("active");
        expect(result.id).toBeDefined();
        orderId = result.id!;
    });

    it("currentOrderByUser should return the active order", async () => {
        const result = await orderStore.currentOrderByUser(userId);
        expect(result).not.toBeNull();
        expect(result?.userId).toEqual(userId);
        expect(result?.status).toEqual("active");
        expect(result?.products?.length).toEqual(0);
    });

    it("addProductToOrder should add a product to the active order", async () => {
        const result = await orderStore.addProductToOrder(orderId, productId, 2);
        expect(result.orderId).toEqual(orderId);
        expect(result.productId).toEqual(productId);
        expect(result.quantity).toEqual(2);
    });

    it("currentOrderByUser should now contain the added product", async () => {
        const result = await orderStore.currentOrderByUser(userId);
        expect(result).not.toBeNull();
        expect(result?.products?.length).toEqual(1);
        expect(result?.products?.[0].productId).toEqual(productId);
        expect(result?.products?.[0].quantity).toEqual(2);
    });

    it("updateOrderStatus should mark the order as complete", async () => {
        const result = await orderStore.updateOrderStatus(orderId, "complete");
        expect(result.status).toEqual("complete");
    });

    it("completedOrdersByUser should return the completed order", async () => {
        const result = await orderStore.completedOrdersByUser(userId);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(orderId);
        expect(result[0].status).toEqual("complete");
    });

    it("currentOrderByUser should return null when no active order exists", async () => {
        const result = await orderStore.currentOrderByUser(userId);
        expect(result).toBeNull();
    });
});
