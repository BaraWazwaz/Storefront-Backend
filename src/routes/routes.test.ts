import supertest from 'supertest';
import app from '../server';
import client from '../database/client';
import { AppUserStore } from '../model/AppUser';

const request = supertest(app);
const userStore = new AppUserStore();

describe("Storefront API Endpoints", () => {
    let token: string;
    let userId: number;
    let productId: number;
    let orderId: number;

    beforeAll(async () => {
        // Clean up database tables
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");

        // We need a user to log in and get a token.
        // Create the FIRST user using the AppUserStore directly.
        const createdUser = await userStore.create({
            firstName: "Admin",
            lastName: "User",
            password: "adminpassword"
        });
        userId = createdUser.id!;

        // Log in to get the JWT token
        const loginResponse = await request
            .post('/users/login')
            .send({
                firstName: "Admin",
                lastName: "User",
                password: "adminpassword"
            });
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await client.query("DELETE FROM order_products;");
        await client.query("DELETE FROM Orders;");
        await client.query("DELETE FROM Product;");
        await client.query("DELETE FROM AppUser;");
    });

    // Users Route Tests
    describe("Users Route Endpoints", () => {
        it("POST /users should create a user when authenticated", async () => {
            const response = await request
                .post('/users')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: "Test",
                    lastName: "User",
                    password: "password123"
                });
            expect(response.status).toEqual(201);
            expect(response.body.user.firstName).toEqual("Test");
            expect(response.body.token).toBeDefined();
        });

        it("POST /users should return 401 when not authenticated", async () => {
            const response = await request
                .post('/users')
                .send({
                    firstName: "Test",
                    lastName: "User",
                    password: "password123"
                });
            expect(response.status).toEqual(401);
        });

        it("GET /users should return a list of users when authenticated", async () => {
            const response = await request
                .get('/users')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(200);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("GET /users/:id should return the specific user when authenticated", async () => {
            const response = await request
                .get(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(200);
            expect(response.body.firstName).toEqual("Admin");
        });
    });

    // Products Route Tests
    describe("Products Route Endpoints", () => {
        it("POST /products should create a product when authenticated", async () => {
            const response = await request
                .post('/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Keyboard",
                    price: 49.99,
                    category: "Electronics"
                });
            expect(response.status).toEqual(201);
            expect(response.body.name).toEqual("Keyboard");
            productId = response.body.id;
        });

        it("POST /products should return 401 when not authenticated", async () => {
            const response = await request
                .post('/products')
                .send({
                    name: "Keyboard",
                    price: 49.99,
                    category: "Electronics"
                });
            expect(response.status).toEqual(401);
        });

        it("GET /products should list all products", async () => {
            const response = await request.get('/products');
            expect(response.status).toEqual(200);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("GET /products/:id should show the specific product", async () => {
            const response = await request.get(`/products/${productId}`);
            expect(response.status).toEqual(200);
            expect(response.body.name).toEqual("Keyboard");
        });

        it("GET /products/category/:category should list products of a category", async () => {
            const response = await request.get('/products/category/Electronics');
            expect(response.status).toEqual(200);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    // Orders Route Tests
    describe("Orders Route Endpoints", () => {
        it("POST /orders should create an order when authenticated", async () => {
            const response = await request
                .post('/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    userId: userId,
                    status: "active"
                });
            expect(response.status).toEqual(201);
            expect(response.body.userId).toEqual(userId);
            expect(response.body.status).toEqual("active");
            orderId = response.body.id;
        });

        it("POST /orders/:id/products should add a product when authenticated", async () => {
            const response = await request
                .post(`/orders/${orderId}/products`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: productId,
                    quantity: 3
                });
            expect(response.status).toEqual(201);
            expect(response.body.productId).toEqual(productId);
            expect(response.body.quantity).toEqual(3);
        });

        it("GET /orders/current/:userId should return current active order", async () => {
            const response = await request
                .get(`/orders/current/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(200);
            expect(response.body.products.length).toEqual(1);
            expect(response.body.products[0].productId).toEqual(productId);
        });

        it("PUT /orders/:id/status should complete order when authenticated", async () => {
            const response = await request
                .put(`/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: "complete"
                });
            expect(response.status).toEqual(200);
            expect(response.body.status).toEqual("complete");
        });

        it("GET /orders/completed/:userId should return completed orders", async () => {
            const response = await request
                .get(`/orders/completed/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(1);
            expect(response.body[0].id).toEqual(orderId);
        });
    });
});
