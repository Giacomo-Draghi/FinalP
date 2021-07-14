const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Movie = require('../models/movie');

exports.getAddMovie = (req, res, next) => {
  res.render('admin/edit-movie', {
    pageTitle: 'Add Movie',
    path: '/admin/add-movie',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddMovie = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const subtitle = req.body.subtitle;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render('admin/edit-movie', {
      pageTitle: 'Add Movie',
      path: '/admin/add-movie',
      editing: false,
      hasError: true,
      movie: {
        title: title,
        subtitle: subtitle,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-movie', {
      pageTitle: 'Add Movie',
      path: '/admin/add-movie',
      editing: false,
      hasError: true,
      movie: {
        title: title,
        subtitle: subtitle,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const movie = new Movie({
    title: title,
    subtitle: subtitle,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  console.log(movie);
  movie
    .save()
    .then(result => {
      res.redirect('/admin/mymovies');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditMovie = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.movieId;
  Movie.findById(prodId)
    .then(movie => {
      if (!movie) {
        return res.redirect('/');
      }
      res.render('admin/edit-movie', {
        pageTitle: 'Edit Movie',
        path: '/admin/edit-movie',
        editing: editMode,
        movie: movie,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditMovie = (req, res, next) => {
  const prodId = req.body.movieId;
  const updatedTitle = req.body.title;
  const updatedSubtitle = req.body.subtitle;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-movie', {
      pageTitle: 'Edit Movie',
      path: '/admin/edit-movie',
      editing: true,
      hasError: true,
      movie: {
        title: updatedTitle,
        subtitle: updatedSubtitle,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Movie.findById(prodId)
    .then(movie => {
      if (movie.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      movie.title = updatedTitle;
      movie.subtitle = updatedSubtitle;
      movie.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(movie.imageUrl);
        movie.imageUrl = image.path;
      }
      return movie.save().then(result => {
        res.redirect('/admin/mymovies');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMovies = (req, res, next) => {
  Movie.find({ userId: req.user._id })
    .then(movies => {
      console.log(movies);
      res.render('admin/mymovies', {
        prods: movies,
        pageTitle: 'Admin Movies',
        path: '/admin/mymovies'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteMovie = (req, res, next) => {
  const prodId = req.body.movieId;
  Movie.findById(prodId)
    .then(movie => {
      if (!movie) {
        return next(new Error('Movie not found.'));
      }
      fileHelper.deleteFile(movie.imageUrl);
      return Movie.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED MOVIE');
      res.redirect('/admin/mymovies');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
