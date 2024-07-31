const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.port || 1101;

// middleware
app.use(cors())
app.use(express.json())


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
    app.get('/services',async(req,res)=>{
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {
            _id : new ObjectId(id)
        };
        const result = await servicesCollection.findOne(query);
        res.send(result)
    })

    // checkOutCollection
    app.post('/checkOuts',async(req,res)=>{
        const checkOutInfo = req.body;
        const result = await checkOutCollection.insertOne(checkOutInfo);
        res.send(result)
    })

    app.get('/checkOuts',async(req,res)=>{
        let query = {};
        if(req.query?.email){
            query = {email:req.query.email}
        }
        const result = await checkOutCollection.find(query).toArray();
        res.send(result)
    })

    app.delete('/checkOuts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {
            _id: new ObjectId(id)
        };
        const result = await checkOutCollection.deleteOne(query);
        res.send(result)
    })

    app.patch('/checkOuts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const updateCheckOut = req.body;
        const updateDocs ={
            $set:{
                status: updateCheckOut.status
            }
        }
        const result = await checkOutCollection.updateOne(query,updateDocs);
        res.send(result)
    })

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('cars_doctor server is running')
})

app.listen(port,()=>{
    console.log(`car_doctor server is running on port ${port}`)
})