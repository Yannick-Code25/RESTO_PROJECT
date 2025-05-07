const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Récupérer l'utilisateur par email
    const result = await pool.query(
      "SELECT id, nom_complet, email, filiere, niveau, mot_de_passe FROM utilisateurs WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const utilisateur = result.rows[0];

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, utilisateur.mot_de_passe);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
   
    // Réponse
    res.status(200).json({
      success: true,
      message: `Bienvenue, ${utilisateur.nom_complet}`,
      token,
      userId : utilisateur.id,
      email: utilisateur.email,
      utilisateur: {
        id: utilisateur.id,
        nom_complet: utilisateur.nom_complet,
        email: utilisateur.email,
        filiere: utilisateur.filiere,
        niveau: utilisateur.niveau,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur du serveur." });
  }
});

module.exports = router;
