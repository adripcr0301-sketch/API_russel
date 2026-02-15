const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { isHtml } = require('../helpers/respond');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      if (isHtml(req)) return res.render('index', { error: 'Email et mot de passe requis' });
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      if (isHtml(req)) return res.render('index', { error: 'Email ou mot de passe incorrect' });
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.cookie('token', token, { httpOnly: true });

    if (isHtml(req)) return res.redirect('/dashboard');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  if (isHtml(req)) return res.redirect('/');
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
