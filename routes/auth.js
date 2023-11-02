const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

router.get('/', function (req, res, next) {
  res.redirect('/auth/github');
});

router.get('/github', function (req, res, next) {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=public_repo`);
});

router.get('/github/callback', async function (req, res, next) {
  const code = req.query.code;
  const token = await fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }, body: JSON.stringify({
      client_id,
      client_secret,
      code,
      redirect_uri
    })
  }).then(res => res.json());
  const user = await fetch(`https://api.github.com/user`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token.access_token}`
    }
  }).then(res => res.json());

  req.session.user = user;
  req.session.token = token.access_token;
  res.redirect('/stars');
});

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/profile', function (req, res, next) {
  res.render('profile', { user: req.session.user });
});

module.exports = router;
