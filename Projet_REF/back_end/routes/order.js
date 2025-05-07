const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("../db"); // Si tu utilises une base de données, ce fichier est nécessaire
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware pour vérifier le token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token manquant" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide" });
    }
    req.user = decoded; // Décoder l'utilisateur pour l'utiliser dans la route

    next(); // Passe à la prochaine fonction (ex: enregistrement de la commande)
  });
}

// Route pour passer une commande
router.post("/", verifyToken, async (req, res) => {
  const { articles, total, paymentMethod, date, status } = req.body;

  // Vérification que l'ID de l'utilisateur est bien présent
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "ID utilisateur manquant" });
  }

  try {
    // 1. Insérer la commande dans la table commandes
    const result = await pool.query(
      "INSERT INTO commandes (utilisateur_id, total, methode_paiement, date_commande) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, total, paymentMethod, date]
    );
    const commandeId = result.rows[0].id;

    // 2. Insérer les articles dans la table commande_produits
    const insertArticlesPromises = articles.map((article) => {
      return pool.query(
        "INSERT INTO commande_produits (commande_id, produit_id, quantite, prix_unitaire) VALUES ($1, $2, $3, $4)",
        [
          commandeId,
          article.produit_id,
          article.quantite,
          article.prix_unitaire,
        ]
      );
    });
    // console.log("Articles envoyés :", articles);

    // Exécution de toutes les requêtes d'insertion des articles
    await Promise.all(insertArticlesPromises);

    // 3. Répondre avec la commande enregistrée
    res.status(201).json({
      success: true,
      message: "Commande enregistrée avec succès",
      commande: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la commande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur du serveur lors de l'enregistrement de la commande",
    });
  }
});

module.exports = router;
