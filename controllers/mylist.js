const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Movie = require('../models/movie');
const Review = require('../models/review');

const ITEMS_PER_PAGE = 4;

exports.getMovies = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  
  Movie.find()
    .countDocuments()
    .then(numMovies => {
      totalItems = numMovies;
      return Movie.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(movies => {
      console.log(movies)
      res.render('shop/movie-list', {
        prods: movies,
        pageTitle: 'Movies',
        path: '/movies',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMovie = (req, res, next) => {
  const prodId = req.params.movieId;
  Movie.findById(prodId)
    .then(movie => {
      Review.find({ movieId: prodId})
      .then(review => {
        res.render('shop/movie-detail', {
        movie: movie,
        pageTitle: movie.title,
        path: '/movies',
        review: review
      })
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Movie.find()
    .countDocuments()
    .then(numMovies => {
      totalItems = numMovies;
      return Movie.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(movies => {
      res.render('shop/index', {
        prods: movies,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMylist = (req, res, next) => {
  req.user
    .populate('mylist.items.movieId')
    .execPopulate()
    .then(user => {
      const movies = user.mylist.items;
      res.render('shop/mylist', {
        path: '/mylist',
        pageTitle: 'Your Favorits List',
        movies: movies
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postMylist = (req, res, next) => {
  const prodId = req.body.movieId;
  Movie.findById(prodId)
    .then(movie => {
      return req.user.addToMylist(movie);
    })
    .then(result => {
      console.log(result);
      res.redirect('/mylist');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postMylistDeleteMovie = (req, res, next) => {
  const prodId = req.body.movieId;
  req.user
    .removeFromMylist(prodId)
    .then(result => {
      res.redirect('/mylist');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postMyReview = (req, res, next) => {
  const prodId = req.body.movieId;
  const reviewBody = req.body.review;
  console.log(reviewBody);
  const review = new Review({
    movieId: prodId,
    userId: req.user,
    review: reviewBody
  });
  console.log(review);
  review
    .save()
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  const allReviews = Review.find({ movieId: prodId});
  console.log(allReviews);
  Movie.findById(prodId)
    .then(movie => {
      Review.find({ movieId: prodId})
      .then(review => {
        res.render('shop/movie-detail', {
        movie: movie,
        pageTitle: movie.title,
        path: '/movies',
        review: review
      })
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};