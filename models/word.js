const mongoose = require('mongoose');

const { Schema } = mongoose;

const wordSchema = new Schema({
  createdBy: {
    type: String,
    required: true,
  },
  wordname: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
