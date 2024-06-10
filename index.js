const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const User = require('./DB-schemas/User');
const Exercise = require('./DB-schemas/Exercise');

app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const connectToDB = async function () {
  try {
    await mongoose.connect(process.env.DB);
  }
  catch (err) {
    console.log(err);
  }
}

connectToDB();

app.get('/api/users', (req, res) => {
  const getAllUsers = async function () {
    try {
      const users = await User.find();
      res.json(users)
    }
    catch (err) {
      res.json({ message: 'Could not fetch users' });
    }
  }

  getAllUsers();
})

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const from = req.query.from === undefined ? new Date('1970-01-01') : new Date(req.query.from);
  const to = req.query.to === undefined ? new Date('2099-01-01') : new Date(req.query.to);
  const limitAmount = Number(req.query.limit) || null;

  const getLogs = async function () {
    try {
      const user = await User.findById(id);

      let logs = await Exercise.find(
        {
          user_id: user._id,
          date: {
            $gte: from,
            $lte: to
          }
        },
        { description: true, duration: true, date: true, _id: false }).limit(limitAmount);

      const count = logs.length;

      logs = logs.map((obj) => {
        return { ...obj._doc, date: obj._doc.date.toDateString() };
      })

      res.status(200).json({
        _id: user._id,
        username: user.username,
        count,
        log: logs
      })

    }
    catch (err) {
      res.status(404).json({ message: 'Could not retrieve user logs'})
    }
  }

  getLogs();
})

app.post('/api/users', (req, res) => {
  const username = req.body.username;

  const createUser = async function () {
    try {
      const user = await User.create({ username });

      return res.status(201).json({
        username: user.username,
        _id: user._id
      });
    }
    catch (err) {
      return res.json({ message: 'Could not created user' });
    }
  }

  createUser();
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date === undefined ? undefined : new Date(req.body.date);

  const createExercise = async function () {

    try {
      const user = await User.findById(id);

      const newExercise = new Exercise({
        user_id: user._id,
        description,
        duration,
      })

      await newExercise.save()

      if (date !== undefined) {
        newExercise.date = date;
        await newExercise.save();
      }

      res.json({
        _id: user._id,
        username: user.username,
        date: newExercise.date.toDateString(),
        duration: newExercise.duration,
        description: newExercise.description
      })

    }
    catch (err) {
      res.status(404).json({ message: 'Could not create exercise'});
    }

  }

  createExercise()
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
