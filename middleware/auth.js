const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.redirect('/');
      }
      return res.status(401).json({ error: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/');
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = authenticate;
