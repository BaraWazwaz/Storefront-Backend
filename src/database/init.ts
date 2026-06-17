import env from '../env';
import { Client } from 'pg';

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
        console.log('Database Setup...');
 
        await client.connect();
        console.log('SUCCESS: Connected to PostgreSQL container as root admin.');
        
        const runQueries = async (client: Client, queries: string[]): Promise<Boolean> => {
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

        console.log('Dropping existing databases and users if they exist...');
        await client.query(`DROP DATABASE IF EXISTS ${DB_TEST_DB} WITH (FORCE);`);
        await client.query(`DROP DATABASE IF EXISTS ${DB_DEPLOY_DB} WITH (FORCE);`);
        await client.query(`DROP USER IF EXISTS ${DB_TEST_USER};`);
        await client.query(`DROP USER IF EXISTS ${DB_DEPLOY_USER};`);

        if (await runQueries(client, [
            `CREATE USER ${DB_TEST_USER} WITH PASSWORD '${DB_TEST_PASSWORD}';`,
            `CREATE USER ${DB_DEPLOY_USER} WITH PASSWORD '${DB_DEPLOY_PASSWORD}';`,
        ])) {
            console.log('SUCCESS: Created database roles');
        } else {
            throw 'FAILURE: Could NOT create database roles';
        }

        if (await runQueries(client, [
            `CREATE DATABASE ${DB_TEST_DB};`,
            `CREATE DATABASE ${DB_DEPLOY_DB};`
        ])) {
            console.log('SUCCESS: Created isolated databases');
        } else {
            throw 'FAILURE: Could NOT create isolated databases';
        }

        if (await runQueries(client, [
            `GRANT ALL PRIVILEGES ON DATABASE ${DB_TEST_DB} TO ${DB_TEST_USER};`,
            `GRANT ALL PRIVILEGES ON DATABASE ${DB_DEPLOY_DB} TO ${DB_DEPLOY_USER};`,
        ])) {
            console.log('SUCCESS: Granted full permissions');
        } else {
            throw 'FAILURE: Could NOT grant full permissions';
        }

        console.log('Public Schema Permissions for PostgreSQL 15+...');
        
        const deployClient = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: DB_POSTGRES_PASSWORD,
            database: DB_DEPLOY_DB
        });
        
        try {
            await deployClient.connect();
            if (await runQueries(deployClient, [
                `GRANT ALL ON SCHEMA public TO ${DB_DEPLOY_USER};`
            ])) {
                console.log('SUCCESS: Granted public permissions to deploy user');
            } else {
                throw 'FAILURE: Could NOT granted public permissions to deploy user';
            }
            await deployClient.end();
        } catch (e) {
            await deployClient.end();
            throw e;
        }
        
        const testClient = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: DB_POSTGRES_PASSWORD,
            database: DB_TEST_DB
        });
        
        try {
            await testClient.connect();
            if (await runQueries(testClient, [
                `GRANT ALL ON SCHEMA public TO ${DB_TEST_USER};`
            ])) {
                console.log('SUCCESS: Granted public permissions to test user');
            } else {
                throw 'FAILURE: Could NOT granted public permissions to test user';
            }
            await testClient.end();
        } catch (e) {
            await testClient.end();
            throw e;
        }

        console.log('Public Schema Permissions granted perfectly!');

        console.log('Database Setup finished successfully!');

    } catch (error) {
        console.error('Database Setup failed: ', error);
    } finally {
        console.log();
        await client.end();
    }
}

setupDatabase();