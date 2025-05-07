const express = require('express');
const cors = require('cors');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register'); // Ajout de la route register
const commandeRoutes = require('./routes/order');
require('dotenv').config();
const pool = require('./db');
const router = express.Router();

const crypto = require('crypto');
const bcrypt = require('bcrypt');




const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes); // Activation de la route register
app.use('/order', commandeRoutes);

// Route test
app.get('/', (req, res) => {
  res.send('API en ligne ✅');
});

//_________________________________________________________
const path = require('path');
app.use(express.static(path.join(__dirname, '../front_end')));

// 🚀 Route pour demander un lien de réinitialisation
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Sécurité : on ne dit pas si l’email est invalide
      return res.json({ message: 'Si cet email existe, un lien vous a été envoyé.' });
    }

    // Génère un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // expire dans 1 heure

    // Sauvegarde dans la table reset_tokens
    await pool.query(
      'INSERT INTO reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      [email, token, expiresAt]
    );

    // 📧 Simule l’envoi de l’email avec le lien
    const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
    console.log(`Lien de réinitialisation : ${resetLink}`);

    return res.json({ message: 'Un lien de réinitialisation vous a été envoyé.' });

  } catch (error) {
    console.error('Erreur forgot-password :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});
//_______________________________________________________________


//-----------------------------------------

// 🚨 Route pour réinitialiser le mot de passe
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Lien invalide ou expiré." });
    }

    const email = result.rows[0].email;

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mise à jour du mot de passe
    await pool.query('UPDATE utilisateurs SET mot_de_passe = $1 WHERE email = $2', [hashedPassword, email]);

    // Suppression du token
    await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);

    return res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur reset-password :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

//-----------------------------------------

// Route pour afficher toutes les commandes par utilisateur avec les prix
app.get('/commandes', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT u.nom_complet, c.id AS commande_id, c.total, c.methode_paiement, c.date_commande, 
                 cp.produit_id, cp.quantite, cp.prix_unitaire
          FROM utilisateurs u
          JOIN commandes c ON u.id = c.utilisateur_id
          JOIN commande_produits cp ON c.id = cp.commande_id;
      `);
      res.json(result.rows);
  } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      res.status(500).send('Erreur serveur');
    }
});


//-------------------------------------

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT} 🚀`);
});
