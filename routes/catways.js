const express = require('express');
const router = express.Router();
const Catway = require('../models/catway');
const authenticate = require('../middleware/auth');

// GET /catways - Lister tous les catways
router.get('/', authenticate, async (req, res) => {
  try {
    const catways = await Catway.find().sort('catwayNumber');

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('catways/list', { catways, user: req.user });
    }

    res.json(catways);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catways/:id - Détails d'un catway
router.get('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({ error: 'Catway non trouvé' });
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('catways/detail', { catway, user: req.user });
    }

    res.json(catway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /catways - Créer un catway
router.post('/', authenticate, async (req, res) => {
  try {
    const catway = new Catway(req.body);
    await catway.save();

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways');
    }

    res.status(201).json(catway);
  } catch (err) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('catways/form', { catway: req.body, error: err.message, user: req.user });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT /catways/:id - Modifier l'état d'un catway
router.put('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({ error: 'Catway non trouvé' });
    }

    // Seul catwayState peut être modifié
    catway.catwayState = req.body.catwayState;
    await catway.save();

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways/' + req.params.id);
    }

    res.json(catway);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /catways/:id - Supprimer un catway
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({ error: 'Catway non trouvé' });
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways');
    }

    res.json({ message: 'Catway supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
