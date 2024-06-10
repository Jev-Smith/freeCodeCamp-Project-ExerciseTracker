const mongoose = require('mongoose');

const exercise = mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: () => new Date()
    }
})

module.exports = mongoose.model('Exercises', exercise);