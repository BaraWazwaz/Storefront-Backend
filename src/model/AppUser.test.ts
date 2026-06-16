import { AppUserStore } from './AppUser';
import client from '../database/client';

const store = new AppUserStore();

describe("AppUser Model", () => {
    let userId: number;

    beforeAll(async () => {
        await client.query("DELETE FROM AppUser;");
    });

    afterAll(async () => {
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

    it("should have an authenticate method", () => {
        expect(store.authenticate).toBeDefined();
    });

    it("create method should add a user", async () => {
        const result = await store.create({
            firstName: "John",
            lastName: "Doe",
            password: "password123"
        });
        expect(result.firstName).toEqual("John");
        expect(result.lastName).toEqual("Doe");
        expect(result.id).toBeDefined();
        if (result.id) {
            userId = result.id;
        }
    });

    it("index method should return a list of users", async () => {
        const result = await store.index();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].firstName).toEqual("John");
    });

    it("show method should return the correct user", async () => {
        const result = await store.show(userId);
        expect(result.firstName).toEqual("John");
        expect(result.lastName).toEqual("Doe");
    });

    it("authenticate method should return user with valid credentials", async () => {
        const result = await store.authenticate("John", "Doe", "password123");
        expect(result).not.toBeNull();
        expect(result?.firstName).toEqual("John");
    });

    it("authenticate method should return null with invalid password", async () => {
        const result = await store.authenticate("John", "Doe", "wrongpassword");
        expect(result).toBeNull();
    });
});
