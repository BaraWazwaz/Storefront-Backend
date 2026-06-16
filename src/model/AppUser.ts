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
            const sql = 'SELECT id, firstName, lastName FROM AppUser;';
            const result = await query(sql, []);
            return result.map((row: any) => ({
                id: row.id,
                firstName: row.firstname,
                lastName: row.lastname
            }));
        } catch (err) {
            throw new Error(`Could not get users: ${err}`);
        }
    }

    async show(id: number): Promise<AppUser> {
        try {
            const sql = 'SELECT id, firstName, lastName FROM AppUser WHERE id = $1;';
            const result = await query(sql, [id]);
            if (result.length === 0) {
                throw new Error(`User with id ${id} not found`);
            }
            const row = result[0];
            return {
                id: row.id,
                firstName: row.firstname,
                lastName: row.lastname
            };
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
            const sql = 'INSERT INTO AppUser (firstName, lastName, password) VALUES ($1, $2, $3) RETURNING id, firstName, lastName;';
            const result = await query(sql, [firstName, lastName, hash]);
            const row = result[0];
            return {
                id: row.id,
                firstName: row.firstname,
                lastName: row.lastname
            };
        } catch (err) {
            throw new Error(`Could not create user: ${err}`);
        }
    }

    async authenticate(firstName: string, lastName: string, password: string): Promise<AppUser | null> {
        try {
            const sql = 'SELECT id, firstName, lastName, password FROM AppUser WHERE firstName = $1 AND lastName = $2;';
            const result = await query(sql, [firstName, lastName]) as AppUser[];
            if (result.length > 0) {
                const user = result[0];
                const isCorrect = await bcrypt.compare(password + pepper, user.password as string);
                if (isCorrect) {
                    return {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    };
                }
            }
            return null;
        } catch (err) {
            throw new Error(`Could not authenticate user: ${err}`);
        }
    }
}