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


/* GET Checkout page. */
router.get('/checkout', function(req, res, next) {
  res.render('checkout', { title: 'checkout' });
});


/* GET MyAccount page. */
router.get('/account', function(req, res, next) {
  res.render('myAccount', { title: 'MyAccount' });
});

module.exports = router;
