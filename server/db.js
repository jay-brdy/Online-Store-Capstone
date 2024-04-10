const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_online_store_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

//completed table
const createTables = async () => {
    const SQL = `
        DROP TABLE IF EXISTS cart_products;
        DROP TABLE IF EXISTS carts;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS products;

        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            address VARCHAR(255),
            payment_info VARCHAR(16),
            is_admin BOOLEAN DEFAULT FALSE
        );
        CREATE TABLE carts(
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL
        );
        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(50),
            description VARCHAR(255),
            price NUMERIC(7,2),
            inventory INTEGER
        );
        CREATE TABLE cart_products(
            id UUID PRIMARY KEY,
            cart_id UUID REFERENCES carts(id) NOT NULL,
            product_id UUID REFERENCES products(id) NOT NULL,
            CONSTRAINT unique_cart_id_and_product_id UNIQUE (cart_id, product_id),
            quantity INTEGER
        );
    `;
    await client.query(SQL);
};

const createUser = async ({ username, password }) => {
    const SQL = `
        INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
};

const createCart = async ({ user_id }) => {
    const SQL = `
        INSERT INTO carts(id, user_id) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id]);
    return response.rows[0];

}

const createProduct = async ({ name, description, price, inventory }) => {
    const SQL = `
        INSERT INTO products(id, name, description, price, inventory) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name, description, price, inventory]);
    return response.rows[0];
};

const createCartProduct = async ({ cart_id, product_id, quantity }) => {
    const SQL = `
        INSERT INTO cart_products(id, cart_id, product_id, quantity) VALUES($1, $2, $3, $4) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), cart_id, product_id, quantity]);
    return response.rows[0];
};

const destroyCartProduct = async ({ cart_id, id }) => {
    const SQL = `
        DELETE FROM cart_products WHERE cart_id=$1 AND id=$2
    `;
    await client.query(SQL, [cart_id, id]);
};

const authenticate = async ({ username, password }) => {
    const SQL = `
        SELECT id, password, username 
        FROM users 
        WHERE username=$1;
    `;
    const response = await client.query(SQL, [username]);
    if (!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)) === false) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    const token = await jwt.sign({ id: response.rows[0].id }, JWT);
    return { token };
};

const findUserWithToken = async (token) => {
    let id;
    try {
        const payload = await jwt.verify(token, JWT);
        id = payload.id
    } catch (ex) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }

    const SQL = `
        SELECT id, username 
        FROM users 
        WHERE id=$1;
    `;
    const response = await client.query(SQL, [id]);
    if (!response.rows.length) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    return response.rows[0];
};

const fetchUsers = async () => {
    const SQL = `
        SELECT id, username FROM users;
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchCarts = async (user_id) => {
    const SQL = `
        SELECT * FROM carts WHERE user_id = $1
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows[0];
}

const fetchProducts = async () => {
    const SQL = `
        SELECT * FROM products;
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchProductById = async (productId) => {
    const SQL = `
        SELECT * FROM products WHERE id = $1
    `;
    const response = await client.query(SQL, [productId]);
    return response.rows[0];
};

const fetchCartProducts = async (user_id) => {
    const SQL = `
        SELECT cart_products.*, products.name, products.description, products.price, cart_products.quantity
        FROM cart_products
        JOIN carts ON cart_products.cart_id = carts.id
        JOIN products ON cart_products.product_id = products.id
        WHERE carts.user_id = $1
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
};

const checkoutCart = async (user_id) => {
    const SQL = `
        DELETE FROM cart_products
        WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)
    `;
    await client.query(SQL, [user_id]);
};

const updateCartProductQuantity = async ({ user_id, product_id, quantity }) => {
    const SQL = `
        UPDATE cart_products 
        SET quantity = $1 + quantity 
        WHERE cart_id = $2 AND product_id = $3
        RETURNING *;
    `;
    const response = await client.query(SQL, [quantity, user_id, product_id]);
    console.log(response.rows[0]);
    return response.rows[0];
};


module.exports = {
    client,
    createTables,
    createUser,
    createCart,
    createProduct,
    createCartProduct,
    fetchUsers,
    fetchCarts,
    fetchProducts,
    fetchProductById,
    fetchCartProducts,
    destroyCartProduct,
    authenticate,
    findUserWithToken,
    updateCartProductQuantity,
    checkoutCart
};
