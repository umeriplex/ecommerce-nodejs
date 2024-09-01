const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categories');


router.get('/', CategoryController.grtCategories);

router.get('/:id', CategoryController.grtCategoriesById);

module.exports = router;