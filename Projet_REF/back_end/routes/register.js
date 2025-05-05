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

router.post('/api/commandes', async (req, res) => {
  const { produits, total, methodePaiement, utilisateurId } = req.body;

  try {
    // 1. Ajouter la commande
    const result = await pool.query(
      'INSERT INTO commandes (utilisateur_id, total, methode_paiement) VALUES ($1, $2, $3) RETURNING id',
      [utilisateurId, total, methodePaiement]
    );
    
    const commandeId = result.rows[0].id;

    // 2. Ajouter les produits dans la commande_produits
    for (const produit of produits) {
      await pool.query(
        'INSERT INTO commande_produits (commande_id, plat_id, quantite, prix) VALUES ($1, $2, $3, $4)',
        [commandeId, produit.id, produit.quantite, produit.prix]
      );
    }

    res.status(200).send('Commande enregistrée avec succès');
  } catch (err) {
    console.error('Erreur ajout commande:', err);
    res.status(500).send('Erreur lors de l\'ajout de la commande');
  }
});

module.exports = router;


module.exports = router;