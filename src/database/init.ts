import env from '../env';
import pg, { Client } from 'pg';

const {
    DB_POSTGRES_PASSWORD,
    DB_TEST_USER,
    DB_TEST_PASSWORD,
    DB_TEST_DB,
    DB_DEPLOY_USER,
    DB_DEPLOY_PASSWORD,
    DB_DEPLOY_DB,
} = env;

async function setupDatabase() {

    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: DB_POSTGRES_PASSWORD,
        database: 'postgres',
    });

    try {

        console.log('Database Setup...')
 
        await client.connect();
        console.log('SUCCESS: Connected to PostgreSQL container as root admin.');
        
        const runQueries = async (queries: string[]): Promise<Boolean> => {
            const runQuery = async (query: string): Promise<Boolean> => {
                try {
                    await client.query(query);
                    return true;
                } catch (err) {
                    if (err instanceof Error) {
                        console.error(`database.ts: setupDatabase() Error: ${err.message}`);
                    }
                    return false;
                }
            };
            const promises = queries.map(q => runQuery(q));
            const statuses = await Promise.all(promises);
            return statuses.every(x => x);
        };

        if (await runQueries([
            `CREATE USER ${DB_TEST_USER} WITH PASSWORD '${DB_TEST_PASSWORD}';`,
            `CREATE USER ${DB_DEPLOY_USER} WITH PASSWORD '${DB_DEPLOY_PASSWORD}';`,
        ])) {
            console.log('SUCCESS: Created database roles');
        } else {
            throw 'FAILURE: Could NOT create database roles';
        }

        if (await runQueries([
            `CREATE DATABASE ${DB_TEST_DB};`,
            `CREATE DATABASE ${DB_DEPLOY_DB};`
        ])) {
            console.log('SUCCESS: Created isolated databases');
        } else {
            throw 'FAILURE: Could NOT create isolated databases';
        }

        if (await runQueries([
            `GRANT ALL PRIVILEGES ON DATABASE ${DB_TEST_DB} TO ${DB_TEST_USER};`,
            `GRANT ALL PRIVILEGES ON DATABASE ${DB_DEPLOY_DB} TO ${DB_DEPLOY_USER};`,
        ])) {
            console.log('SUCCESS: Granted full permissions');
        } else {
            throw 'FAILURE: Could NOT grant full permissions';
        }

        console.log('Database Setup finished successfully!');

    } catch (error) {

        console.error('Database Setup failed: ', error);

    } finally {

        console.log();
        await client.end();

    }
}

setupDatabase();