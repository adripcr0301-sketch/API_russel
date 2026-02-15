const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticate = require('../middleware/auth');
const { isHtml } = require('../helpers/respond');

router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find();
    if (isHtml(req)) return res.render('users/list', { users, user: req.user });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// formulaire ajout
router.get('/new', authenticate, (req, res) => {
  res.render('users/form', { formUser: {}, error: null, user: req.user });
});

router.get('/:email', authenticate, async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.params.email });
    if (!foundUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (isHtml(req)) return res.render('users/detail', { foundUser, user: req.user });
    res.json(foundUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    if (isHtml(req)) return res.redirect('/users');
    res.status(201).json(newUser);
  } catch (err) {
    if (isHtml(req)) {
      return res.render('users/form', { formUser: req.body, error: err.message, user: req.user });
    }
    res.status(400).json({ error: err.message });
  }
});

router.put('/:email', authenticate, async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.params.email });
    if (!foundUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (req.body.username) foundUser.username = req.body.username;
    if (req.body.email) foundUser.email = req.body.email;
    if (req.body.password) foundUser.password = req.body.password;
    await foundUser.save();

    if (isHtml(req)) return res.redirect('/users/' + foundUser.email);
    res.json(foundUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:email', authenticate, async (req, res) => {
  try {
    const foundUser = await User.findOneAndDelete({ email: req.params.email });
    if (!foundUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    if (isHtml(req)) return res.redirect('/users');
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
