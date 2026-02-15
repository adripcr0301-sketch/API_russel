const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const Catway = require('../models/catway');
const authenticate = require('../middleware/auth');

// GET /reservations - Lister toutes les réservations
router.get('/reservations', authenticate, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort('catwayNumber');

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('reservations/all', { reservations, user: req.user });
    }

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catways/:id/reservations - Lister les réservations d'un catway
router.get('/catways/:id/reservations', authenticate, async (req, res) => {
  try {
    const reservations = await Reservation.find({ catwayNumber: req.params.id });

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('reservations/list', { reservations, catwayNumber: req.params.id, user: req.user });
    }

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catways/:id/reservations/new - Formulaire de création
router.get('/catways/:id/reservations/new', authenticate, (req, res) => {
  res.render('reservations/form', { reservation: {}, catwayNumber: req.params.id, error: null, user: req.user });
});

// GET /catways/:id/reservations/:idReservation - Détails d'une réservation
router.get('/catways/:id/reservations/:idReservation', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('reservations/detail', { reservation, user: req.user });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /catways/:id/reservations - Créer une réservation
router.post('/catways/:id/reservations', authenticate, async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id });
    if (!catway) {
      return res.status(404).json({ error: 'Catway non trouvé' });
    }

    const reservation = new Reservation({
      ...req.body,
      catwayNumber: req.params.id
    });
    await reservation.save();

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways/' + req.params.id + '/reservations');
    }

    res.status(201).json(reservation);
  } catch (err) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('reservations/form', {
        reservation: req.body,
        catwayNumber: req.params.id,
        error: err.message,
        user: req.user
      });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT /catways/:id/reservations/:idReservation - Modifier une réservation
router.put('/catways/:id/reservations/:idReservation', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.idReservation, catwayNumber: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways/' + req.params.id + '/reservations/' + req.params.idReservation);
    }

    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /catways/:id/reservations/:idReservation - Supprimer une réservation
router.delete('/catways/:id/reservations/:idReservation', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({
      _id: req.params.idReservation,
      catwayNumber: req.params.id
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/catways/' + req.params.id + '/reservations');
    }

    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
