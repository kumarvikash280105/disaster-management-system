const Update = require('../models/Update');

async function listUpdates(req, res) {
  try {
    const { location = '', emergencyType = 'All' } = req.query;
    const query = {};

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (emergencyType && emergencyType !== 'All') {
      query.emergencyType = emergencyType;
    }

    const updates = await Update.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ updates });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch updates.', error: error.message });
  }
}

module.exports = {
  listUpdates,
};
