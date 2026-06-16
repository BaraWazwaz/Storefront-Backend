CREATE TABLE Product (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    price    DOUBLE PRECISION NOT NULL,
    category VARCHAR(100)
);