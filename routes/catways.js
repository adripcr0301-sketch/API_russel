const express = require('express');
const router = express.Router();
const Catway = require('../models/catway');
const authenticate = require('../middleware/auth');
const { isHtml } = require('../helpers/respond');

// liste de tous les catways
router.get('/', authenticate, async (req, res) => {
  try {
    const catways = await Catway.find().sort('catwayNumber');
    if (isHtml(req)) return res.render('catways/list', { catways, user: req.user });
    res.json(catways);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// formulaire création
router.get('/new', authenticate, (req, res) => {
  res.render('catways/form', { catway: {}, error: null, user: req.user });
});

// détails d'un catway
router.get('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });
    if (!catway) return res.status(404).json({ error: 'Catway non trouvé' });

    if (isHtml(req)) return res.render('catways/detail', { catway, user: req.user });
    res.json(catway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// création d'un catway
router.post('/', authenticate, async (req, res) => {
  try {
    const catway = new Catway(req.body);
    await catway.save();
    if (isHtml(req)) return res.redirect('/catways');
    res.status(201).json(catway);
  } catch (err) {
    if (isHtml(req)) {
      return res.render('catways/form', { catway: req.body, error: err.message, user: req.user });
    }
    res.status(400).json({ error: err.message });
  }
});

// modification de l'état uniquement (numéro et type non modifiables)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });
    if (!catway) return res.status(404).json({ error: 'Catway non trouvé' });

    catway.catwayState = req.body.catwayState;
    await catway.save();

    if (isHtml(req)) return res.redirect('/catways/' + req.params.id);
    res.json(catway);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// suppression
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });
    if (!catway) return res.status(404).json({ error: 'Catway non trouvé' });

    if (isHtml(req)) return res.redirect('/catways');
    res.json({ message: 'Catway supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
