'use strict';

let express = require('express');
let controller = require('./project.controller');

let router = express.Router();

router.get('/', controller.index);
router.get('/fileList', controller.fileList);

module.exports = router;
