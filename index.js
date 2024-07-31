const express = require('express');
const cors = require('express');
const app = express();
require('dotenv').config();
const port = process.env.port || 1101;

// middleware
app.use(cors())
app.use(express.json())


// mongoDB connection
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('cars_doctor server is running')
})

app.listen(port,()=>{
    console.log(`car_doctor server is running on port ${port}`)
})