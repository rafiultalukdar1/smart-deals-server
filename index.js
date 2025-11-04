const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

// middle-ware
app.use(cors());
app.use(express.json());

// smart-deals
// vmFIpzbr5cRM1W6l

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASS}@cluster0.w0v9pwr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('Smart server is running!')
});

async function run() {
    try{
        await client.connect();
        
        const db = client.db('smart_db');
        const productsCollection = db.collection('products');
        const bidsCollection = db.collection('bids');
        const usersCollection = db.collection('users');


        // Users Post
        app.post('/users', async (req, res) =>{
            const newUser = req.body;

            const email = req.body.email;
            const query = {email : email};
            const existingUser = await usersCollection.findOne(query);
            if(existingUser) {
                return res.send({ message: 'User already exist!' });
            }
            else{
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        });

        // Users Post
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // latest product
        app.get('/latest-product', async (req, res) =>{
            const cursor = productsCollection.find().sort({created_at: -1}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });


        // Get all products from the database
        app.get('/products', async (req, res) => {
            console.log(req.query);
            const email = req.query.email;
            const query = {};
            if(email) {
                query.email = email;
            }
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // single product details
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id : id };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });


        // Add database related api
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        // update
        app.patch('/products/:id', async (req, res) =>{
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id : new ObjectId(id) };
            const update = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price
                }
            }
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
        });


        // Delete
        app.delete('/products/:id', async (req, res) =>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Bids related API
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if(email){
                query.buyer_email = email;
            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Products Bid Id
        app.get('/products/bids/:productsId', async (req, res) => {
            const productsId = req.params.productsId;
            const query = { product: productsId };
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // All Bids
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.buyer_email = email;
            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Delet Bids
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.deleteOne(query);
            res.send(result);
        });

        // Bids Post
        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{

    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log(`Smart server is running on port ${port}`);
});
