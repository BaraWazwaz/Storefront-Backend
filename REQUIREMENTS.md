# API Requirements & Technical Design

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

## API Endpoints

### Products

| Endpoint | Method | Description | Token Required |
|----------|--------|-------------|----------------|
| `/products` | `GET` | Index | No |
| `/products/:id` | `GET` | Show | No |
| `/products` | `POST` | Create | Yes |
| `/products/popular` | `GET` | Top 5 Popular Products | No |
| `/products/category/:category` | `GET` | Products by Category | No |

### Users

| Endpoint | Method | Description | Token Required |
|----------|--------|-------------|----------------|
| `/users` | `GET` | Index | Yes |
| `/users/:id` | `GET` | Show | Yes |
| `/users` | `POST` | Create | No |
| `/users/login` | `POST` | Login (Generates JWT) | No |

### Orders

| Endpoint | Method | Description | Token Required |
|----------|--------|-------------|----------------|
| `/orders/current/:userId` | `GET` | Current Order by User | Yes |
| `/orders/completed/:userId` | `GET` | Completed Orders by User | Yes |
| `/orders` | `POST` | Create Order | Yes |
| `/orders/:id/products` | `POST` | Add Product to Order | Yes |
| `/orders/:id/status` | `PUT` | Update Order Status | Yes |

---

## Database Schema Design

The Postgres database consists of 4 main tables:

### 1. `AppUser`
Stores storefront user profiles.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | SERIAL | Primary Key |
| `firstName` | VARCHAR(100) | Not Null |
| `lastName` | VARCHAR(100) | Not Null |
| `password` | VARCHAR(255) | Not Null |

> **Note**: The password is Hashed with bcrypt + Pepper.

### 2. `Product`
Stores the catalog of available products.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | SERIAL | Primary Key |
| `name` | VARCHAR(255) | Not Null |
| `price` | NUMERIC(10, 2) | Not Null |
| `category` | VARCHAR(100) | Nullable |

### 3. `Orders`
Tracks user shopping carts (active status) and finalized transactions (complete status).

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | SERIAL | Primary Key |
| `user_id` | INTEGER | Not Null, FK |
| `status` | VARCHAR(20) | Not Null |

> **Note**: The status can be either `'active'` (for current shopping carts) or `'complete'` (for finalized transactions).

### 4. `order_products`
Join table representing the many-to-many relationship between orders and products.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | SERIAL | Primary Key |
| `user_id` | INTEGER | Not Null, FK |
| `status` | VARCHAR(20) | Not Null |

### 4. `order_products`
Join table representing the many-to-many relationship between orders and products.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | SERIAL | Primary Key |
| `order_id` | INTEGER | Not Null, FK |
| `product_id` | INTEGER | Not Null, FK |
| `quantity` | INTEGER | Not Null |
