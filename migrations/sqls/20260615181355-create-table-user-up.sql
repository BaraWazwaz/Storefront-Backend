CREATE TABLE AppUser (
    id       SERIAL  PRIMARY KEY,
    name     VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    CONSTRAINT name_rules CHECK (name ~ '^[A-Za-z0-9_]{2,20}$')
);