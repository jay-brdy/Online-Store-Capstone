const {
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
  } = require('./db');

  const cors = require('cors');
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(require("morgan")("dev"));
  
  //for deployment only
  const path = require('path');
  app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));
  app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets'))); 
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT','DELETE'],
    credentials: true,
    withCredentials: true,
  }))
  
  // check if user is logged in
  const isLoggedIn = async(req, res, next)=> {
    try {
      req.user = await findUserWithToken(req.headers.authorization.split(' ')[1]);
      next();
    }
    catch(ex){
      next(ex);
    }
  };

  // create a new user
  app.post('/api/auth/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const newUser = await createUser({ username, password });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});
  
  // user auth
  app.post('/api/auth/login', async(req, res, next)=> {
    try {
      const { token } = await authenticate(req.body);
      const user = await findUserWithToken(token);
      const cart = await fetchCarts(user.id);
      res.send({ token, user, cart });
    }
    catch(ex){
      next(ex);
    }
  });
  
  // retrieves user information
  app.get('/api/auth/me', isLoggedIn, async(req, res, next)=> {
    try {
      res.send(req.user);
    }
    catch(ex){
      next(ex);
    }
  });
  
  // retrieves all users
  app.get('/api/users', async(req, res, next)=> {
    try {
      res.send(await fetchUsers());
    }
    catch(ex){
      next(ex);
    }
  });
  
  // retrieves entire cart with products for a specifc user
  app.get('/api/users/:user_id/cart/products', isLoggedIn, async(req, res, next)=> {
    try {
      if(req.params.user_id !== req.user.id){
        const error = Error('not authorized');
        error.status = 401;
        throw error;
      }
      const cartProducts = await fetchCartProducts(req.params.user_id);
      res.json(cartProducts);
    }
    catch(ex){
      next(ex);
    }
  });

   // retrieves all products
   app.get('/api/products', async(req, res, next)=> {
    try {
      res.send(await fetchProducts());
    }
    catch(ex){
      next(ex);
    }
  });

  // retrieves single product by id
  app.get('/api/products/:id', async (req, res, next) => {
    const productId = req.params.id;
    try {
        const product = await fetchProductById(productId);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(product);
        }
    } catch (ex) {
        next(ex);
    }
});
  
  // creates a product inside cart for a user
  app.post('/api/users/:user_id/cart/products', isLoggedIn, async(req, res, next)=> {
    try {
      if(req.params.user_id !== req.user.id){
        const error = Error('not authorized');
        error.status = 401;
        throw error;
      }
      const cart = await fetchCarts(req.params.user_id);
      res.status(201).send(await createCartProduct({ 
        user_id: cart.id, 
        product_id: req.body.product_id,
        quantity: req.body.quantity
      }));
    }
    catch(ex){
      next(ex);
    }
  });

  // update cart
  app.put('/api/users/:user_id/cart/products/:product_id', isLoggedIn, async(req, res, next)=> {
    try {
      if (req.params.user_id !== req.user.id) {
        const error = Error('Not authorized');
        error.status = 401;
        throw error;
      }
      const cart = await fetchCarts(req.params.user_id);
      const { quantity } = req.body;
      const updatedProduct = await updateCartProductQuantity({
          user_id: cart.id,
          product_id: req.params.product_id,
          quantity: quantity
      });
      if (!updatedProduct) {
        res.sendStatus(404); // Send 404 if product not found in cart
      } else {
        res.sendStatus(204); // Send 204 if product quantity updated successfully
    }
    } catch (ex) {
      next(ex);
    }
  });

  // proceeds to checkout
  app.post('/api/users/:user_id/cart/checkout', isLoggedIn, async(req, res, next)=> {
    try {
        if (req.params.user_id !== req.user.id) {
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        await checkoutCart(req.params.user_id);
        res.send({ message: 'Checkout successful!' });
    } catch(ex) {
        next(ex);
    }
});
  
  // deletes a product from a cart of a user
  app.delete('/api/users/:user_id/cart/products/:product_id', isLoggedIn, async(req, res, next)=> {
    try {
      if(req.params.cart_id !== req.user.id){
        const error = Error('not authorized');
        error.status = 401;
        throw error;
      }
      await destroyCartProduct({cart_id: req.params.cart_id, id: req.params.id });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.use((err, req, res, next)=> {
    console.log(err);
    res.status(err.status || 500).send({ error: err.message ? err.message : err });
  });

  // ADMIN abilities

  // admin see all users

  // admin add product

  // admin update/edit product

  // admin delete product from inventory


  
  // init function 
  const init = async()=> {
    await client.connect();
    console.log('connected to database');
  
    await createTables();
    console.log('tables created');
  
    const [moe, lucy, chau, jay, tshirt, jacket, hat, socks, sticker] = await Promise.all([
      createUser({ username: 'moe', password: 'm_pw'}),
      createUser({ username: 'lucy', password: 'l_pw'}),
      createUser({ username: 'chau', password: 'c_pw'}),
      createUser({ username: 'jay', password: 'j_pw', is_admin: true}),
      createProduct({
         name: 'tshirt',
         description: 'a very cool tshirt',
         price: 25.00,
         inventory: 100
      }),
      createProduct({ 
         name: 'jacket',
         description: 'a very comfy jacket',
         price: 50.00,
         inventory: 100
      }),
      createProduct({ 
         name: 'hat',
         description: 'an accessory to block the sun',
         price: 15.00,
         inventory: 100
      }),
      createProduct({ 
         name: 'socks',
         description: 'a garment to keep your toes protected',
         price: 10.00,
         inventory: 100
      }),
      createProduct({
         name: 'sticker',
         description: 'show your support by representing us',
         price: 3.00,
         inventory: 100 
      })
    ]);
  
    console.log(await fetchUsers());
    console.log(await fetchProducts());
  
    const [moeCart, lucyCart, chauCart, jayCart] = await Promise.all([
      createCart({ user_id: moe.id }),
      createCart({ user_id: lucy.id }),
      createCart({ user_id: chau.id }),
      createCart({ user_id: jay.id })
    ]);
    console.log(await fetchCarts());

    const inCart = await Promise.all([
      createCartProduct({
         user_id: moeCart.id,
         product_id: tshirt.id,
         quantity: 1
      }),
      createCartProduct({
        user_id: moeCart.id,
        product_id: jacket.id,
        quantity: 1
      }),
      createCartProduct({
        user_id: moeCart.id,
        product_id: hat.id,
        quantity: 2
      })
    ]);
    // console.log(inCart);

    console.log(await fetchCartProducts(moe.id));
    // console.log(await fetchCartProducts(moeCart.id));
    // const cart_product = await createCartProduct({ cart_id: moe.id, product_id: tshirt.id });

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  };
  
  // invoke init function
  init();
  
  