const express = require('express');
const mongoose = require('mongoose');
const Reviews = require('./review');
const Dealerships = require('./dealership');
const { reviews } = require('./data/reviews.json');
const { dealerships } = require('./data/dealerships.json');

const app = express();
app.use(express.json());

function route(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

app.get('/', (req, res) => res.send('Dealership API'));
app.get('/fetchDealers', route(async (req, res) => {
  res.json(await Dealerships.find().sort({ id: 1 }).lean());
}));
app.get('/fetchDealers/:state', route(async (req, res) => {
  res.json(await Dealerships.find({ state: req.params.state }).sort({ id: 1 }).lean());
}));
app.get('/fetchDealer/:id', route(async (req, res) => {
  res.json(await Dealerships.find({ id: req.params.id }).lean());
}));
app.get('/fetchReviews', route(async (req, res) => {
  res.json(await Reviews.find().sort({ id: -1 }).lean());
}));
app.get('/fetchReviews/dealer/:id', route(async (req, res) => {
  res.json(await Reviews.find({ dealership: req.params.id }).sort({ id: -1 }).lean());
}));

app.post('/insert_review', route(async (req, res) => {
  const counter = await mongoose.connection.collection('counters').findOneAndUpdate(
    { _id: 'reviews' }, { $inc: { value: 1 } }, { returnDocument: 'after' },
  );
  const review = await Reviews.create({ ...req.body, id: counter.value });
  res.status(201).json(review);
}));

app.use((error, req, res, next) => {
  console.error(error.message);
  const status = /ValidationError|CastError/.test(error.name) ? 400 : 500;
  res.status(status).json({ error: 'The dealership request could not be completed.' });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/dealershipsDB');
  for (const [model, data] of [[Dealerships, dealerships], [Reviews, reviews]]) {
    await model.collection.createIndex({ id: 1 }, { unique: true });
    await model.bulkWrite(data.map(item => ({
      updateOne: { filter: { id: item.id }, update: { $setOnInsert: item }, upsert: true },
    })));
  }
  const latest = await Reviews.findOne().sort({ id: -1 }).lean();
  await mongoose.connection.collection('counters').updateOne(
    { _id: 'reviews' }, { $max: { value: latest?.id || 0 } }, { upsert: true },
  );
  app.listen(Number(process.env.PORT || 3030), () => console.log('Dealership API ready'));
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
