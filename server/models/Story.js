const mongoose = require('mongoose');

const sentenceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 200
  },
  author: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  sentences: [sentenceSchema],
  genre: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Story', storySchema);