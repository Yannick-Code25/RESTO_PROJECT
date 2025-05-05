const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');


app.use(cors());
app.use(bodyParser.json());

app.use('/api/register', registerRoute);
app.use('/login', loginRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
