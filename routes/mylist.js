const path = require('path');

const express = require('express');

const movieController = require('../controllers/mylist');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', movieController.getIndex);

router.get('/movie-list', movieController.getMovies);

router.get('/movie-detail/:movieId', movieController.getMovie);

router.get('/mylist', isAuth, movieController.getMylist);

router.post('/mylist', isAuth, movieController.postMylist);

router.post('/mylist-delete-item', isAuth, movieController.postMylistDeleteMovie);

router.post('/add-review', isAuth, movieController.postMyReview);

module.exports = router;
