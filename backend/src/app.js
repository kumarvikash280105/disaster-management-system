const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const validationRoutes = require('./routes/validationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const donationRoutes = require('./routes/donationRoutes');
const updateRoutes = require('./routes/updateRoutes');

const app = express();
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
  res.json({ message: 'CDMS backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/updates', updateRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/:page', (req, res, next) => {
  const requestedFile = path.join(frontendPath, req.params.page);
  if (path.extname(requestedFile) !== '.html') {
    return next();
  }
  return res.sendFile(requestedFile, (error) => {
    if (error) next();
  });
});

module.exports = app;
