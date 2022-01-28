const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();



const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.is406.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// ASYNC FUNCTION
async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        const database = client.db("Travellio");
        const userCollection = database.collection("users");
        const blogCollection = database.collection("blogs");


        //  POST API (CREATE DATA FROM CLIENT)

        // (POST) FOR BLOGS
        app.post('/blogs', async (req, res) => {
            const product = req.body;
            console.log('Hitting the blogs post');

            const result = await blogCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })


        // (POST) FOR USERS
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);

        })



        //  GET API



        app.get('/users', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = userCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const users = await cursor.toArray();
            res.send(users);
        })


        app.get('/blogs', async (req, res) => {

            // RUN FIND OPERATION FOR ALL DATA FROM DATABASE COLLECTION                         
            const cursor = blogCollection.find({});

            // CONVERT DATA TO AN ARRAY
            const users = await cursor.toArray();
            res.send(users);
        })

        //  GET SINGLE BLOG (READ SPECIFIC DATA FROM SERVER DATABASE)
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await blogCollection.findOne(query);
            console.log('getting specific blog', id);
            res.json(product);
        })




        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //  PUT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);


        })


        // admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        //  DELETE API (DELETE DATA FROM CLIENT)
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            console.log('Delete request generated from client side for id:', id);
            res.json(result);
        })

        //  PUT API (UPDATE DATA FROM CLIENT)
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus.status,
                },
            };
            const result = await blogCollection.updateOne(filter, updateDoc, options);
            console.log('updating service');
            res.json(result);
        })



    } finally {
        // await client.close();
    }
}
// CALL ASYNC FUNCTION TO EXECUTE
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('Hello from the Travellio Server')
});

app.listen(port, () => {
    console.log('Listening to', port)
});
