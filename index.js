const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

// middleware
app.use(cors({
    origin: ['http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yib2rqv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'forbidden' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        // err
        if (err) {
            console.log(err);
            return res.status(401).send({ message: 'Unauthorized' })
        }
        // If token is valid then would be decoded.
        console.log('Value in the token', decoded);
        req.user = decoded;
        next();
    })


}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const dinenosCollection = client.db("dinenosDb").collection("allFoodItems");
        const purchaseCollection = client.db("dinenosDb").collection("purchaseItems");
        const blogCollection = client.db("dinenosDb").collection("blog");

        app.get('/allFoodItems', async (req, res) => {
            const cursor = dinenosCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/allFoodItems', async (req, res) => {
            const foodItem = req.body;
            const result = await dinenosCollection.insertOne(foodItem);
            res.send(result)
        })

        


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Dinenos is running')
})

app.listen(port, () => {
    console.log(`Dinenos is running at PORT: ${port}`);
})