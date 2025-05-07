CREATE TABLE utilisateurs (
  id SERIAL PRIMARY KEY,
  nom_complet VARCHAR(100) NOT NULL,
  filiere VARCHAR(50) NOT NULL,
  niveau VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(100) NOT NULL
);
CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL,
  total NUMERIC NOT NULL,
  methode_paiement VARCHAR(50) NOT NULL,
  date_commande TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE commande_produits (
  id SERIAL PRIMARY KEY,
  commande_id INTEGER REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id INTEGER NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC NOT NULL
);
CREATE TABLE reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
