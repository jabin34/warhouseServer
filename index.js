const express = require('express');
const cors = require('cors');
const app = express(); 
const port = process.env.PORT || 4000 ;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
//middleware 
app.use(cors());
app.use(express.json());

//jwt verifying
function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'Unauthorized Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.TOKEN_SECRET,(error,decoded) =>{
        if(error){
            return res.status(403).send({message:'Forbidden Access'});
        }
        console.log('decoded',decoded);
        console.log('verify jwt',authHeader);
        req.decoded = decoded;
        next();
    })
    
    
}

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

//Auth
app.post('/login',async(req,res)=>{
 const user = req.body;
 const token = jwt.sign(user,process.env.TOKEN_SECRET,{
     expiresIn:'19d'
 });
 res.send({token});
})

app.get('/inventory',async(req,res)=>{
    const  query = {};
    const cursor = inventoryCollection.find(query);
    const inventory = await cursor.toArray();
    res.send(inventory);
});
app.get('/inventory/:id',async(req,res)=>{
    const id = req.params.id;
    const  query = {_id:ObjectId(id)};
    const inventory = await inventoryCollection.findOne(query);
    res.send(inventory);
});
//quantity decrease //quantityadd
app.put('/inventory/:id',async(req,res)=>{
    const id = req.params.id;
    const data = req.body;
    const filter = {_id:ObjectId(id)};
    const option = {upsert:true};
    const update = {
        $set:{ quantity:data.newQty},
    };
    const result = await inventoryCollection.updateOne(filter,update,option);
    console.log('data->',data);
    res.send({result});
})
//Delete 
app.delete('/inventory/:id',async(req,res)=>{
    const id  = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await inventoryCollection.deleteOne(query);
    res.send(result);
});
//post --- add item 
app.post('/inventory',async(req,res)=>{
    const additem = req.body;
    const result = await inventoryCollection.insertOne(additem);
    res.send(result);
});
//my item api 
app.get('/myItem',verifyJWT,async(req,res)=>{
const decodedEmail = req.decoded.email;
const email = req.query.email; 
if(email === decodedEmail) {
    const query = {email:email};
    const cursor = inventoryCollection.find(query);
    const item = await cursor.toArray();
    res.send(item);
}
else{
   res.status(403).send({message:'Forbidden access'}); 
}
});
}finally{
   console.log('testing');
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
