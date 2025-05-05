const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // Ajoute dans .env

router.post('/', async (req, res) => {
  const { nomComplet, filiere, niveau, email, password } = req.body;

  try {
    const emailCheck = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO utilisateurs (nom_complet, filiere, niveau, email, mot_de_passe) VALUES ($1, $2, $3, $4, $5)',
      [nomComplet, filiere, niveau, email, hashedPassword]
    );

    // Crée un token JWT après inscription
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ message: 'Inscription réussie !', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

module.exports = router;
