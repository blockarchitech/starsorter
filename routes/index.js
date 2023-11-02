const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/stars', function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/auth');
  }
  res.render('stars', { user: JSON.stringify(req.session.user), token: req.session.token })

});

module.exports = router;
