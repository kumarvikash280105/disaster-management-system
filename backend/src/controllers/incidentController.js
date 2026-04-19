const Incident = require('../models/Incident');
const User = require('../models/User');

async function createIncident(req, res) {
  try {
    const { title, type, location, severity, description, reporterId } = req.body;

    if (!title || !type || !location || !severity || !description || !reporterId) {
      return res.status(400).json({ message: 'All incident fields are required.' });
    }

    const reporter = await User.findById(reporterId);
    if (!reporter) {
      return res.status(404).json({ message: 'Reporter account not found.' });
    }

    const incident = await Incident.create({
      title,
      type,
      location,
      severity,
      description,
      reportedBy: reporter._id,
      reporterName: reporter.name,
      reporterRole: reporter.role,
    });

    return res.status(201).json({
      message: 'Incident report submitted successfully.',
      incident,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit incident.', error: error.message });
  }
}

async function listIncidents(req, res) {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v');

    return res.json({ incidents });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch incidents.', error: error.message });
  }
}

module.exports = {
  createIncident,
  listIncidents,
};
