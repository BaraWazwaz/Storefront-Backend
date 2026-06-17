import { storeOrderProduct } from './OrderProduct';
import { storeAppUser } from './AppUser';
import { storeProduct, ProductWithPopularity } from './Product';
import { storeOrder } from './Order';
import client from '../database/client';

describe("OrderProduct Model", () => {
    let userId: number;
    let orderId: number;
    let productIds: number[] = [];

    beforeAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");

        const user = await storeAppUser.create({
            firstName: "OrderProduct",
            lastName: "Tester",
            password: "password123"
        });
        userId = user.id as number;

        const productNames = [
            { name: "Widget A", price: 10.00, category: "Gadgets" },
            { name: "Widget B", price: 20.00, category: "Gadgets" },
            { name: "Widget C", price: 30.00, category: "Gadgets" },
            { name: "Widget D", price: 40.00, category: "Tools" },
            { name: "Widget E", price: 50.00, category: "Tools" },
            { name: "Widget F", price: 60.00, category: "Tools" }
        ];

        for (const p of productNames) {
            const product = await storeProduct.create(p);
            productIds.push(product.id as number);
        }

        const order = await storeOrder.create({ userId, status: "active" });
        orderId = order.id as number;
    });

    afterAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    it("should have a getOrderProducts method", () => {
        expect(storeOrderProduct.getOrderProducts).toBeDefined();
    });

    it("should have a getTop5PopularProducts method", () => {
        expect(storeOrderProduct.getTop5PopularProducts).toBeDefined();
    });

    it("should have an addProductToOrder method", () => {
        expect(storeOrderProduct.addProductToOrder).toBeDefined();
    });

    it("should have an updateProductQuantityInOrder method", () => {
        expect(storeOrderProduct.updateProductQuantityInOrder).toBeDefined();
    });

    it("should have a deleteProductFromOrder method", () => {
        expect(storeOrderProduct.deleteProductFromOrder).toBeDefined();
    });

    it("addProductToOrder should add a product to an order", async () => {
        const result = await storeOrderProduct.addProductToOrder(orderId, productIds[0], 5);
        expect(result.orderId).toEqual(orderId);
        expect(result.productId).toEqual(productIds[0]);
        expect(result.quantity).toEqual(5);
    });

    it("getOrderProducts should return products in an order", async () => {
        const result = await storeOrderProduct.getOrderProducts(orderId);
        expect(result.length).toEqual(1);
        expect(result[0].orderId).toEqual(orderId);
        expect(result[0].productId).toEqual(productIds[0]);
        expect(result[0].quantity).toEqual(5);
        expect(result[0].name).toEqual("Widget A");
        expect(result[0].price).toEqual(10.00);
        expect(result[0].category).toEqual("Gadgets");
    });

    it("updateProductQuantityInOrder should update the quantity", async () => {
        const result = await storeOrderProduct.updateProductQuantityInOrder(
            orderId, productIds[0], 10
        );
        expect(result.orderId).toEqual(orderId);
        expect(result.productId).toEqual(productIds[0]);
        expect(result.quantity).toEqual(10);
    });

    it("getOrderProducts should reflect the updated quantity", async () => {
        const result = await storeOrderProduct.getOrderProducts(orderId);
        expect(result.length).toEqual(1);
        expect(result[0].quantity).toEqual(10);
    });

    it("deleteProductFromOrder should remove the product from the order", async () => {
        await storeOrderProduct.deleteProductFromOrder(orderId, productIds[0]);
        const result = await storeOrderProduct.getOrderProducts(orderId);
        expect(result.length).toEqual(0);
    });

    it("getOrderProducts should return empty list for order with no products", async () => {
        const result = await storeOrderProduct.getOrderProducts(orderId);
        expect(result.length).toEqual(0);
    });

    describe("getTop5PopularProducts", () => {
        beforeAll(async () => {
            await client.query("DELETE FROM order_products;");
            for (let i = 0; i < productIds.length; i++) {
                await storeOrderProduct.addProductToOrder(
                    orderId, productIds[i], (productIds.length - i) * 10
                );
            }
        });

        it("should return at most 5 products", async () => {
            const result = await storeOrderProduct.getTop5PopularProducts();
            expect(result.length).toEqual(5);
        });

        it("should return products ordered by total quantity descending", async () => {
            const result = await storeOrderProduct.getTop5PopularProducts();
            expect(result[0].name).toEqual("Widget A");
            expect(result[0].productsCount).toEqual(60);
            expect(result[1].name).toEqual("Widget B");
            expect(result[1].productsCount).toEqual(50);
            expect(result[2].name).toEqual("Widget C");
            expect(result[2].productsCount).toEqual(40);
            expect(result[3].name).toEqual("Widget D");
            expect(result[3].productsCount).toEqual(30);
            expect(result[4].name).toEqual("Widget E");
            expect(result[4].productsCount).toEqual(20);
        });

        it("should exclude the 6th product from the top 5", async () => {
            const result = await storeOrderProduct.getTop5PopularProducts();
            const names = result.map((r: ProductWithPopularity) => r.name);
            expect(names).not.toContain("Widget F");
        });

        it("should include product details (name, price, category)", async () => {
            const result = await storeOrderProduct.getTop5PopularProducts();
            for (const item of result) {
                expect(item.name).toBeDefined();
                expect(item.price).toBeDefined();
                expect(item.category).toBeDefined();
                expect(item.productsCount).toBeDefined();
            }
        });

        it("should return empty list when no order_products exist", async () => {
            await client.query("DELETE FROM order_products;");
            const result = await storeOrderProduct.getTop5PopularProducts();
            expect(result.length).toEqual(0);
        });
    });
});
