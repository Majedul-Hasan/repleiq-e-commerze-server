const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnect, client } = require('./config/configDB');
const { tokenPost, verifyJWT } = require('./middleware/authMiddleware');

const morgan = require('morgan');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5171;
// middleware
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));

// jwt
app.post('/jwt', tokenPost);

async function run() {
  try {
    dbConnect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection('users');
    const productsCollection = database.collection('products');
    const cartCollection = database.collection('carts');
    const paymentCollection = database.collection('payments');

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res
          .status(403)
          .send({ error: true, message: 'forbidden message' });
      }
      next();
    };

    // users
    // create user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists' });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // users related apis
    app.get('/users/subscriber', verifyJWT, verifyAdmin, async (req, res) => {
      const query = { role: 'subscriber', _id: new ObjectId(id) };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.send(user);
    });
    // users related apis
    app.get(
      '/users/subscriber/:id',
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const query = { role: 'subscriber' };
        const result = await usersCollection.find(query).toArray();
        res.send(result);
      }
    );
    //admin verification route
    app.get('/users/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      // console.log(email, query);
      if (req.decoded.email !== email) {
        res.send({ role: false });
      }
      const user = await usersCollection.findOne(query);
      // console.log(user);
      const result = { role: user?.role };
      res.send(result);
    });

    // user make admin
    app.patch('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin',
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete(
      '/users/admin/:user_id',
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.user_id;

        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      }
    );
    // product releted api

    //public products
    //courses public route
    app.get('/products', async (req, res) => {
      const { limit } = req.query;
      const limInt = parseInt(limit) || 0;
      const products = await productsCollection
        .find(query)
        .limit(limInt)
        .sort({ uploadAt: -1 })
        .toArray();

      res.send(products);
    });

    // create product
    app.post('/products', verifyJWT, verifyAdmin, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.sendFile(__dirname + '/file.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
