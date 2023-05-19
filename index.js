const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rfymji.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


const toyCollection = client.db('toyWorld').collection('allToys');
const addToyCollection = client.db('toyWorld').collection('addNew')


const indexKeys = { name: 1, category: 1 }; 
const indexOptions = { name: "nameCategory" }; 

const result = await toyCollection.createIndex(indexKeys, indexOptions);

app.get('/toySearchByName/:text', async(req, res) => {
    const searchText = req.params.text;


    const result = await toyCollection.find({
        $or: [
            {name: {$regex: searchText, options: 'i'}},
            {category: {$regex: searchText, options: 'i'}},
        ],
    })
    .toArray();
    res.send(result);
   
})






// app.get('/allToys/:text', async(req, res) => {
//     console.log(req.params.text);
//     if(req.params.text == "Bus" || req.params.text == "truck" || req.params.text == "car"){
//         const result = toyCollection.find({category: req.params.text}).toArray();
//         return res.send(result);
//     }
//     // const result = toyCollection.findOne().toArray();
//     // res.send(result);
// })


app.get('/allToys', async(req, res) => {
    const cursor = toyCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

app.get('/allToys/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}

    const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {quantity: 1, name: 1, rating: 1,  seller_name: 1, picture: 1, seller_email: 1, price: 1, description: 1 },
      };
  
    const result = await toyCollection.findOne(query, options);
    res.send(result)
})


// addNewToy

app.post('/addNew', async(req, res) => {
    const addToy = req.body;
    console.log(addToy);
    const result = await addToyCollection.insertOne(addToy);
    res.send(result)
})


app.get('/addNew', async(req, res) => {
    const cursor = addToyCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})


app.get('/addNew/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await addToyCollection.findOne(query);
    res.send(result)
})


app.put('/addNew/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true}
    const updatedToy = req.body;
    const Toy = {
        $set: {
            price: updatedToy.price,
            quantity: updatedToy.quantity,
            description: updatedToy.description
        }
    }
    const result = await addToyCollection.updateOne(filter, Toy, options);
    res.send(result);
})


app.delete('/addNew/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await addToyCollection.deleteOne(query);
    res.send(result);
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
    res.send('Toy Car is running')
})

app.listen(port, () => {
    console.log(`Toy Car is running on port: ${port}`)
})



