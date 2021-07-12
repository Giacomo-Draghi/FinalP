const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Movie = require('../models/movie');
const Favorite = require('../models/favorite');

const ITEMS_PER_PAGE = 2;

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
      res.render('shop/movie-detail', {
        movie: movie,
        pageTitle: movie.title,
        path: '/movies'
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

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.movieId')
    .execPopulate()
    .then(user => {
      const movies = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        movies: movies
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.movieId;
  Movie.findById(prodId)
    .then(Movie => {
      return req.user.addToCart(movie);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteMovie = (req, res, next) => {
  const prodId = req.body.movieId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postFavorite = (req, res, next) => {
  req.user
    .populate('cart.items.movieId')
    .execPopulate()
    .then(user => {
      const movies = user.cart.items.map(i => {
        return { quantity: i.quantity, movie: { ...i.movieId._doc } };
      });
      const favorite = new Favorite({
        user: {
          email: req.user.email,
          userId: req.user
        },
        movies: movies
      });
      return favorite.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/favorites');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getFavorites = (req, res, next) => {
  Favorite.find({ 'user.userId': req.user._id })
    .then(favorites => {
      res.render('shop/favorites', {
        path: '/favorites',
        pageTitle: 'Your favorites',
        favorites: favorites
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const favoriteId = req.params.favoriteId;
  favorite.findById(favoriteId)
    .then(favorite => {
      if (!favorite) {
        return next(new Error('No favorite found.'));
      }
      if (favorite.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + favoriteId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalSubtitle = 0;
      favorite.movies.forEach(prod => {
        pdfDoc
          .fontSize(14)
          .text(
            prod.movie.title +
              ' - ' +
              prod.movie.subtitle
          );
      });
      pdfDoc.text('---');

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
