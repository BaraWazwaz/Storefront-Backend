import env from '../env';
import { Pool } from 'pg';

const {
    DB_TEST_USER,
    DB_TEST_PASSWORD,
    DB_TEST_DB,
    DB_DEPLOY_USER,
    DB_DEPLOY_PASSWORD,
    DB_DEPLOY_DB,
    MODE
} = env;

const client = new Pool({
    host:     'localhost',
    database: MODE === 'test' ? DB_TEST_DB       : DB_DEPLOY_DB,
    user:     MODE === 'test' ? DB_TEST_USER     : DB_DEPLOY_USER,
    password: MODE === 'test' ? DB_TEST_PASSWORD : DB_DEPLOY_PASSWORD
});

export default client;

export async function query(sql: string, args: unknown[]) {
    try {
        const session = await client.connect();
        const result = await session.query(sql, args);
        session.release();
        return result.rows;
    } catch (err) {
        throw new Error(`Error: ${err}`);
    }
}