const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  audioFileName:{
    type:String,
    required:true
  }
});

const AudioModel = mongoose.model('Audio', audioSchema);

module.exports = {AudioModel}