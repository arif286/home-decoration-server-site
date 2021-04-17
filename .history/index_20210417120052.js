const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnfgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("doctors"));


const port = 5000;

app.get("/", (req, res) => {
  res.send("hello world");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client
    .db("interiorDesign")
    .collection("services");
    const orderCollection = client.db("interiorDesign").collection("orders");
    const reviewCollection = client.db("interiorDesign").collection("reviews");
    const adminCollection = client.db("interiorDesign").collection("adminPanel");

  console.log("database connected");

  app.post("/addService", (req, res) => {
    console.log(req.body);
    const service = req.body;
    serviceCollection.insertOne(service)
      .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

    app.get('/singleService/:id', (req, res) => {
        const findService = req.params.id;
        serviceCollection
          .find({ _id: ObjectId(findService) })
          .toArray((err, documents) => {
            if (err) {
              res.status(404).send('Not found')

            }
            else {
              res.send(documents);
            }
          });
    })
  app.post('/processOrder', (req, res) => {
    orderCollection.insertOne(req.body)
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post('/order', (req, res) => {
    console.log(req.body);
    orderCollection.find({ email: req.body.email })
      .toArray((err, documents) => {
        res.send(documents)
    })
  })
  app.post('/review', (req, res) => {
    reviewCollection.insertOne(req.body)
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  });

  app.get('/setReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  });
  app.get('/orderList', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.post('/addAdmin', (req, res) => {
    console.log(req.body);
    adminCollection.insertOne(req.body)
      .then(result => {
        res.send(result.insertedCount > 0);
      });
  });

  app.patch("/updateStatus/:id", (req, res) => {
    console.log(req.params.id);
    console.log(req.body);
    orderCollection.updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: { status: req.body.status },
      }
    ).then(result => {
      res.send(result.matchedCount > 0)
      console.log(result);
    })
  });

  // app.post("/appointmentsByDate", (req, res) => {
  //   const date = req.body;
  //   const email = req.body.email;
  //   doctorCollection.find({ email: email }).toArray((err, doctors) => {
  //     const filter = { date: date.date };
  //     if (doctors.length === 0) {
  //       filter.email = email;
  //     }
  //     appointmentCollection.find(filter).toArray((err, documents) => {
  //       console.log(email, date.date, doctors, documents);
  //       res.send(documents);
  //     });
  //   });
  // });

  app.post("/addADoctor", (req, res) => {

      doctorCollection.insertOne(req.body)
          .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/doctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/isDoctor", (req, res) => {
    const email = req.body.email;
    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });
});



app.listen(process.env.PORT || port);