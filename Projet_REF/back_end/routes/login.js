const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    const utilisateur = result.rows[0];
    const isMatch = await bcrypt.compare(password, utilisateur.mot_de_passe);

    if (!isMatch) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      {
        id: utilisateur.id, // ou utilisateur.id_utilisateur selon ta table
        email: utilisateur.email,
        nom: utilisateur.nom_complet
      },
      JWT_SECRET,
      { expiresIn: '72h' }
      
    );
    // console.log(token);
    res.status(200).json({
      message: `Bienvenue, ${utilisateur.nom_complet}`,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur." });
  }
});

module.exports = router;
