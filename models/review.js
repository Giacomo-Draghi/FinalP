const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    movieId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
  review: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Review', reviewSchema);
