import bcrypt from 'bcrypt';
import env from '../env';
import { query } from "../database/client";

const { BCRYPT_PASSWORD, SALT_ROUNDS } = env;
const saltRounds = parseInt(SALT_ROUNDS || '10', 10);
const pepper = BCRYPT_PASSWORD || '';

export default interface AppUser {
    id?: number;
    firstName: string;
    lastName: string;
    password?: string;
};

export class AppUserStore {
    async index(): Promise<AppUser[]> {
        try {
            const sql = 'SELECT id, firstName AS "firstName", lastName AS "lastName" FROM AppUser;';
            const result = (await query(sql, [])) as AppUser[];
            return result;
        } catch (err) {
            throw new Error(`Could not get users: ${err}`);
        }
    }

    async show(id: number): Promise<AppUser> {
        try {
            const sql = 'SELECT id, firstName AS "firstName", lastName AS "lastName" FROM AppUser WHERE id = $1;';
            const result = (await query(sql, [id])) as AppUser[];
            if (result.length === 0) {
                throw new Error(`User with id ${id} not found`);
            }
            return result[0];
        } catch (err) {
            throw new Error(`Could not get user: ${err}`);
        }
    }

    async create(user: AppUser): Promise<AppUser> {
        try {
            const { firstName, lastName, password } = user;
            if (!password) {
                throw new Error('Password is required');
            }
            const hash = await bcrypt.hash(password + pepper, saltRounds);
            const sql = `
                INSERT INTO AppUser (firstName, lastName, password)
                VALUES ($1, $2, $3)
                RETURNING id, firstName AS "firstName", lastName AS "lastName";
            `;
            const result = (await query(sql, [firstName, lastName, hash])) as AppUser[];
            return result[0];
        } catch (err) {
            throw new Error(`Could not create user: ${err}`);
        }
    }

    async authenticate(firstName: string, lastName: string, password: string): Promise<AppUser | null> {
        try {
            const sql = 'SELECT id, firstName AS "firstName", lastName AS "lastName", password FROM AppUser WHERE firstName = $1 AND lastName = $2;';
            const result = (await query(sql, [firstName, lastName])) as AppUser[];
            if (result.length === 0)
                return null;
            const user = result[0];
            if (!user.password)
                return null;
            const isCorrect = await bcrypt.compare(password + pepper, user.password);
            if (isCorrect)
                return user;
            else
                return null;
        } catch (err) {
            throw new Error(`Could not authenticate user: ${err}`);
        }
    }
}

export const storeAppUser = new AppUserStore();