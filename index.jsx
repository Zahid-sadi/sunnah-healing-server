 const express = require('express');
 const cors = require('cors');
 require('dotenv').config()
 const { MongoClient, ServerApiVersion } = require('mongodb');

 const port = process.env.PORT || 5000;

 const app = express();

 app.use(cors());
 app.use(express.json());


 
 app.get('/',(req,res)=>{
    res.send('sunnah healing is running')
 } )


 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2hres75.mongodb.net/?retryWrites=true&w=majority`;
 console.log(uri);
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
        const Appointments = client.db('sunnahHealing').collection('appointmentCategory')


        app.get('/appointments', async(req, res )=>{
            const result = await Appointments.find().toArray();
            // const result = await cursor.toArray();
            res.send(result)
        });









     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
     // Ensures that the client will close when you finish/error
    //  await client.close();
   }
 }
 run().catch(console.dir);
 
 app.listen (port,()=>console.log(`sunnah healing running ${port}`));