const mongoose = require('mongoose');
require('dotenv').config();

const Catway = require('./models/catway');
const Reservation = require('./models/reservation');
const User = require('./models/user');

const catways = require('./Fichiers/catways.json');
const reservations = require('./Fichiers/reservations.json');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Nettoyage des collections
    await Catway.deleteMany({});
    await Reservation.deleteMany({});

    // Import des catways
    await Catway.insertMany(catways);
    console.log(`${catways.length} catways importés`);

    // Import des réservations
    await Reservation.insertMany(reservations);
    console.log(`${reservations.length} réservations importées`);

    // Création d'un utilisateur par défaut
    const existingUser = await User.findOne({ email: 'admin@portrussel.fr' });
    if (!existingUser) {
      await User.create({
        username: 'admin',
        email: 'admin@portrussel.fr',
        password: 'admin123'
      });
      console.log('Utilisateur admin créé (admin@portrussel.fr / admin123)');
    }

    console.log('Seed terminé');
    process.exit(0);
  } catch (err) {
    console.error('Erreur seed :', err);
    process.exit(1);
  }
}

seed();
