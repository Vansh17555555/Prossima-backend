const express = require('express');
require('dotenv').config();

const tenderRoutes = require('./routes/tenders');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard middleware
app.use(express.json());

// Routes
app.use('/api/tenders', tenderRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling basic
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`IREPS Backend running on port ${PORT}`);
});

module.exports = app;
