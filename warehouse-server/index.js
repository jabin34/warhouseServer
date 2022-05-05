const express = require('express');
const cors = require('cors');
const app = express(); 
const port = process.env.PORT || 4000 ;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

//middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5wovs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log("database connected");
//   // perform actions on the collection object
//   client.close();
// });
async function run(){
try{
await client.connect();
const inventoryCollection = client.db('warehouse').collection('inventory');

app.get('/inventory',async(req,res)=>{
    const  query = {};
    const cursor = inventoryCollection.find(query);
    const inventory = await cursor.toArray();
    res.send(inventory);
})



}finally{
   
}

}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send("server is running");
});

//port listening

app.listen(port,()=>{
    console.log('listening to port',port);
});
