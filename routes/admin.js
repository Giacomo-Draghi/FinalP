const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-movie => GET
router.get('/add-movie', isAuth, adminController.getAddMovie);

// /admin/mymovies => GET
router.get('/mymovies', isAuth, adminController.getMovies);

// /admin/add-movie => POST
router.post(
  '/add-movie',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('subtitle').isString(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddMovie
);

router.get('/edit-movie/:movieId', isAuth, adminController.getEditMovie);

router.post(
  '/edit-movie',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('subtitle').isString(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditMovie
);

router.post('/delete-movie', isAuth, adminController.postDeleteMovie);

module.exports = router;
