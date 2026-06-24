const {getAllPosts, getPostById} = require('../controllers/get.controller')
const { Router } = require('express');

const router = Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);

module.exports = router;