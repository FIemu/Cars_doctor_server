const express = require('express');
const cors = require('cors');
const app = express();
const cookieParse = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.port || 1101;

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
const logger = async (req, res, next) => {
    // console.log('called:', req.host, req.originalUrl);
    next();
}
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).send({ message: 'not authorized' })
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            console.log(err)
            return res.status(401).send({message:'access token not valid'})
        }
        req.user = decoded;
        next();
    })
}
app.use(express.json())
app.use(cookieParse())


// mongoDB connection
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xphzfyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {

        const servicesCollection = client.db('carsDoctor').collection('services');
        const checkOutCollection = client.db('carsDoctor').collection('checkOuts');

        // servicesCollection
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await servicesCollection.findOne(query);
            res.send(result)
        })

        // checkOutCollection
        app.post('/checkOuts', async (req, res) => {
            const checkOutInfo = req.body;
            const result = await checkOutCollection.insertOne(checkOutInfo);
            res.send(result)
        })

        app.get('/checkOuts',verifyToken, async (req, res) => {
            if(req.query.email !== req.user.email){
                return res.status(403).send({message:'forbidden access'})
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await checkOutCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/checkOuts/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await checkOutCollection.deleteOne(query);
            res.send(result)
        })

        app.patch('/checkOuts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateCheckOut = req.body;
            const updateDocs = {
                $set: {
                    status: updateCheckOut.status
                }
            }
            const result = await checkOutCollection.updateOne(query, updateDocs);
            res.send(result)
        })

        // jwt token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('accessToken', token, {
                    httpOnly: true,
                    secure: false
                })
                .send({ success: true })
        })

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('cars_doctor server is running')
})

app.listen(port, () => {
    console.log(`car_doctor server is running on port ${port}`)
})