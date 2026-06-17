CREATE TABLE order_products (
    order_id   INTEGER NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Product(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL,
    CONSTRAINT order_product_pk PRIMARY KEY (order_id, product_id)
);