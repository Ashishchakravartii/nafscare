var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET Shop page. */
router.get('/shop', function(req, res, next) {
  res.render('shop', { title: 'shop' });
});

module.exports = router;
