const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { isHtml } = require('../helpers/respond');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return isHtml(req) ? res.redirect('/') : res.status(401).json({ error: 'Accès non autorisé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

    req.user = user;
    next();
  } catch (err) {
    return isHtml(req) ? res.redirect('/') : res.status(401).json({ error: 'Token invalide' });
  }
};
