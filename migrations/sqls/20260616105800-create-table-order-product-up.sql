CREATE TABLE order_products (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Product(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL
);