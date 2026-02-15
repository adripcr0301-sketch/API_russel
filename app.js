const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const catwayRoutes = require('./routes/catways');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');
const authenticate = require('./middleware/auth');
const Reservation = require('./models/reservation');

const app = express();

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur MongoDB :', err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Moteur de vue EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Page d'accueil
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

// Dashboard
app.get('/dashboard', authenticate, async (req, res) => {
  const now = new Date();
  const reservations = await Reservation.find({
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort('catwayNumber');

  res.render('dashboard', {
    user: req.user,
    reservations,
    date: now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  });
});

// Routes API
app.use('/', authRoutes);
app.use('/catways', catwayRoutes);
app.use('/', reservationRoutes);
app.use('/users', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

module.exports = app;
