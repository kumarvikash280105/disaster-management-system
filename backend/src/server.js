const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const app = require('./app');
const connectDatabase = require('./config/db');
const seedDefaults = require('./controllers/seedController');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    await seedDefaults();

    app.listen(PORT, () => {
      console.log(`CDMS server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
