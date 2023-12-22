const express = require("express");
const app = express();
const cors = require("cors");
const port = 3030;

// middlewae
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://taskUp:A0eyBcTwwaGrKg4s@cluster0.gbcelyw.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to this server");
});

const tasksCollection = client.db("task_manager").collection("tasks");

// get user specific service
app.get("/api/tasks", async (req, res) => {
  const userEmail = req.query.email;

  console.log(userEmail);

  const result = await tasksCollection.find({ userEmail: userEmail }).toArray();
  res.send(result);
});

app.post("/api/addTask", async (req, res) => {
  const task = req.body;
  const result = await tasksCollection.insertOne(task);
  console.log(result);
  res.send(result);
});

app.put("/api/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateTask = req.body;
  const task = {
    $set: {
      title: updateTask.title,
      userEmail: updateTask.userEmail,
      description: updateTask.description,
      deadline: updateTask.deadline,
      priority: updateTask.priority,
      status: updateTask.status,
    },
  };
  const result = await tasksCollection.updateOne(filter, task, options);
  res.send(result);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await tasksCollection.deleteOne(query);
  console.log(result);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
