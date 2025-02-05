const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});