const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  mylist: {
    items: [
      {
        movieId: {
          type: Schema.Types.ObjectId,
          ref: 'Movie',
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToMylist = function(movie) {
  const mylistMovieIndex = this.mylist.items.findIndex(cp => {
    return cp.movieId.toString() === movie._id.toString();
  });
  let newQuantity = 1;
  const updatedMylistItems = [...this.mylist.items];

  if (mylistMovieIndex >= 0) {
    console.log('do nothing')
  } else {
    updatedMylistItems.push({
      movieId: movie._id
    });
  }
  const updatedMylist = {
    items: updatedMylistItems
  };
  this.mylist = updatedMylist;
  return this.save();
};

userSchema.methods.removeFromMylist = function(movieId) {
  const updatedMylistItems = this.mylist.items.filter(item => {
    return item.movieId.toString() !== movieId.toString();
  });
  this.mylist.items = updatedMylistItems;
  return this.save();
};

userSchema.methods.clearMylist = function() {
  this.mylist = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);