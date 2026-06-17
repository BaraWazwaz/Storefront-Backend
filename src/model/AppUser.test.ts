import { storeAppUser } from './AppUser';
import client from '../database/client';

describe("AppUser Model", () => {
    let userId: number;

    beforeAll(async () => {
        await client.query("DELETE FROM AppUser;");
    });

    afterAll(async () => {
        await client.query("DELETE FROM AppUser;");
    });

    it("should have an index method", () => {
        expect(storeAppUser.index).toBeDefined();
    });

    it("should have a show method", () => {
        expect(storeAppUser.show).toBeDefined();
    });

    it("should have a create method", () => {
        expect(storeAppUser.create).toBeDefined();
    });

    it("should have an authenticate method", () => {
        expect(storeAppUser.authenticate).toBeDefined();
    });

    it("create method should add a user", async () => {
        const result = await storeAppUser.create({
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
        const result = await storeAppUser.index();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].firstName).toEqual("John");
    });

    it("show method should return the correct user", async () => {
        const result = await storeAppUser.show(userId);
        expect(result.firstName).toEqual("John");
        expect(result.lastName).toEqual("Doe");
    });

    it("authenticate method should return user with valid credentials", async () => {
        const result = await storeAppUser.authenticate("John", "Doe", "password123");
        expect(result).not.toBeNull();
        expect(result?.firstName).toEqual("John");
    });

    it("authenticate method should return null with invalid password", async () => {
        const result = await storeAppUser.authenticate("John", "Doe", "wrongpassword");
        expect(result).toBeNull();
    });
});
