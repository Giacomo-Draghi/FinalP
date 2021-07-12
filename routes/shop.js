const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/mymovies', shopController.getMovies);

router.get('/mymovies/:movieId', shopController.getMovie);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteMovie);

router.post('/create-favorite', isAuth, shopController.postFavorite);

router.get('/favorites', isAuth, shopController.getFavorites);

router.get('/favorites/:favoriteId', isAuth, shopController.getInvoice);

module.exports = router;
