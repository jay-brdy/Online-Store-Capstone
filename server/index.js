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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets')));
app.use(cors({
  origin: ['http://localhost:5173', 'https://jays-fishing-market.netlify.app', 'https://main--jays-fishing-market.netlify.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  withCredentials: true,
}))

// check if user is logged in
const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization.split(' ')[1]);
    next();
  }
  catch (ex) {
    next(ex);
  }
};

// create a new user
app.post('/api/auth/register', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const newUser = await createUser({ username, password });

    // create a cart for newly registered user
    await createCart({ user_id: newUser.id });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// user auth
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { token } = await authenticate(req.body);
    const user = await findUserWithToken(token);
    const cart = await fetchCarts(user.id);
    res.send({ token, user, cart });
  }
  catch (ex) {
    next(ex);
  }
});

// retrieves user information
app.get('/api/auth/me', isLoggedIn, async (req, res, next) => {
  try {
    res.send(req.user);
  }
  catch (ex) {
    next(ex);
  }
});

// retrieves all users
app.get('/api/users', async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  }
  catch (ex) {
    next(ex);
  }
});

// retrieves entire cart with products for a specifc user
app.get('/api/users/:user_id/cart/products', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.user_id !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const cartProducts = await fetchCartProducts(req.params.user_id);
    res.json(cartProducts);
  }
  catch (ex) {
    next(ex);
  }
});

// retrieves all products
app.get('/api/products', async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  }
  catch (ex) {
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
app.post('/api/users/:user_id/cart/products', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.user_id !== req.user.id) {
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
  catch (ex) {
    next(ex);
  }
});

// update cart
app.put('/api/users/:user_id/cart/products/:product_id', isLoggedIn, async (req, res, next) => {
  try {
    console.log("product_id:", req.params.product_id); // DELETE LATER
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
app.post('/api/users/:user_id/cart/checkout', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.user_id !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await checkoutCart(req.params.user_id);
    res.send({ message: 'Checkout successful!' });
  } catch (ex) {
    next(ex);
  }
});

// deletes a product from a cart of a user
app.delete('/api/users/:user_id/cart/products/:product_id', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.user_id !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const cart = await fetchCarts(req.params.user_id); // Fetch cart using user_id
    await destroyCartProduct({
      cart_id: cart.id,
      product_id: req.params.product_id
    });
    res.sendStatus(204);
  }
  catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message ? err.message : err });
});

// ADMIN abilities

// admin see all users

// admin add product

// admin update/edit product

// admin delete product from inventory



// init function 
const init = async () => {
  await client.connect();
  console.log('connected to database');

  await createTables();
  console.log('tables created');

  const [moe, lucy, chau, jay, horseMackerel, carp, pufferfish, seabass, clownfish, salmon, catfish, goldfish, oceanSunfish, koi, mahimahi, tuna, hammerheadShark, blueMarlin, arowana ] = await Promise.all([
    createUser({ username: 'moe', password: 'm_pw' }),
    createUser({ username: 'lucy', password: 'l_pw' }),
    createUser({ username: 'chau', password: 'c_pw' }),
    createUser({ username: 'jay', password: 'j_pw', is_admin: true }),
    createProduct({
      name: 'Anchovy',
      description: 'There are more than 140 species of anchovy, but they do all have some things in common. They are small and feed by simply swimming with their mouths open to filter food particles from the sea.',
      price: 2.00,
      size: 2,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/d/d1/NH-encyclopedia-Anchovy.png"
    }),
    createProduct({
      name: 'Carp',
      description: 'The carp is a common river fish found throughout the year. It is the commoner cousin to the koi, the goldfish, and the popeyed goldfish.',
      price: 3.00,
      size: 4,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/0/0e/Carp_nh.png"
    }),
    createProduct({
      name: 'Pufferfish',
      description: 'The Pufferfish is a fish that appears in the ocean. As a defense mechanism, puffers have the ability to inflate rapidly, filling their extremely elastic stomachs with water (or air when outside the water) until they are almost spherical in shape.',
      price: 28.00,
      size: 3,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/9/97/55._Igelfisch.png"
    }),
    createProduct({
      name: 'Black bass',
      description: 'The black bass is a formidably strong fish and, as such, is a common target for sport anglers. In some areas, there are even those who professionally catch just black bass! Yet in other areas where they are NOT native, they are considered an ecological nuisance. Invasive, even.',
      price: 8.00,
      size: 5,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/2/2e/Black_bass_nh.png"
    }),
    createProduct({
      name: 'Ray',
      description: 'The ray is an unusually shaped fish with a flat body and a long body, somewhat related to sharks. Seen from the bottom, the mouth on its stomach appears to be smiling.',
      price: 20.00,
      size: 1,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/6/66/Ray_NH.png"
    }),
    createProduct({
      name: 'Salmon',
      description: 'A salmon\'s coloration is due specifically to their diet. The more salmon fill their diet with crustaceans such as krill and shrimp, the deeper shade of pink they are.',
      price: 26.00,
      size: 4,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/2/2e/Salmon-NH.png"
    }),
    createProduct({
      name: 'Catfish',
      description: 'Catfish don\'t have scales and are rather slimy. This slime helps them breathe! Some species of catfish are nocturnal, and they\'ll feed on almost anything. They use a suctioning action to pull in their food.',
      price: 23.00,
      size: 4,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/a/ad/Catfish_nh.png"
    }),
    createProduct({
      name: 'Goldfish',
      description: 'The goldfish is a rare river fish that can be found throughout the year. They can grow up to a foot in length. The size of the tank they are kept in tends to constrict their growth. Please get the appropriate sized tank for them!',
      price: 10.00,
      size: 1,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/d/d9/Goldfish_nh.png"
    }),
    createProduct({
      name: 'Ocean Sunfish',
      description: 'The ocean sunfish is a large relative of the blowfish with an unusual shape, like a fish head with a tail. They are a fairly relaxed species, often content to ride where the currents take them.',
      price: 300.00,
      size: 6,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/0/01/NH-Ocean_sunfish.png"
    }),
    createProduct({
      name: 'Koi',
      description: 'Koi are a variety of carp bred for their color mutations...starting more than a thousand years ago!',
      price: 160.00,
      size: 4,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/3/34/Koi_nh.png"
    }),
    createProduct({
      name: 'Mahi-mahi',
      description: 'The mahi-mahi is an ocean fish known for its wide face. It can reach over six feet long. It is known by different names including "dolphinfish," even though it has no relation to dolphins. They live in only in warm, tropical waters.',
      price: 260.00,
      size: 5,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/8/8d/NH-fish-Mahimahi.png"
    }),
    createProduct({
      name: 'Tuna',
      description: 'The tuna is a large ocean fish that can reach upwards of nine feet long. Besides its great size, it\'s notable for continuing to swim even when it\'s sleeping! ',
      price: 220.00,
      size: 6,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/6/6c/NH-Tuna.png"
    }),
    createProduct({
      name: 'Hammerhead Shark',
      description: 'The hammerhead shark is known for its distinctive, hammer-shaped head, hence the name. This oddly shaped head allows the beast to see 360 degrees around itself, from top to bottom.',
      price: 600.00,
      size: 6,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/a/a5/Hammerhead-Shark-Critterpedia.jpg"
    }),
    createProduct({
      name: 'Blue Marlin',
      description: 'The blue marlin has a distinctive angular shape and no scales. It is an unusual relative of the tuna. These mighty fish can exceed 13 feet from bill to tail. Some accounts even have it fighting with whales!',
      price: 420.00,
      size: 6,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/6/6a/NH-Blue-Marlin.png"
    }),
    createProduct({
      name: 'Arowana',
      description: 'Behold the majestic Arowana, adorned with iridescent scales that shimmer like liquid gold, symbolizing power, fortune, and resilience. Arowanas are excellent jumpers. Some have been seen leaping six feet out of the water',
      price: 1000.00,
      size: 4,
      inventory: 100,
      imageURL: "https://static.wikia.nocookie.net/animalcrossing/images/9/90/Arowana-0.png"
    })
  ]);

  console.log('Users: ', await fetchUsers());
  console.log('Products: ', await fetchProducts());

  const [moeCart, lucyCart, chauCart, jayCart] = await Promise.all([
    createCart({ user_id: moe.id }),
    createCart({ user_id: lucy.id }),
    createCart({ user_id: chau.id }),
    createCart({ user_id: jay.id })
  ]);
  console.log('Carts: ', await fetchCarts());

  const inCart = await Promise.all([
    createCartProduct({
      user_id: moeCart.id,
      product_id: horseMackerel.id,
      quantity: 1
    }),
    createCartProduct({
      user_id: moeCart.id,
      product_id: carp.id,
      quantity: 1
    }),
    createCartProduct({
      user_id: moeCart.id,
      product_id: pufferfish.id,
      quantity: 2
    })
  ]);

  console.log('Moes cart: ', await fetchCartProducts(moe.id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

// invoke init function
init();

