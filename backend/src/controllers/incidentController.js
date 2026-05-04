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
      status: 'Submitted',
      approvalStatus: 'pending',
      progressPercent: 10,
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
    const { viewerId } = req.query;
    let viewer = null;
    if (viewerId) {
      viewer = await User.findById(viewerId).select('role');
    }

    const query = viewer && viewer.role !== 'Admin' ? { reportedBy: viewerId } : {};
    const incidents = await Incident.find()
      .find(query)
      .sort({ createdAt: -1 })
      .limit(viewer && viewer.role === 'Admin' ? 100 : 20)
      .select('-__v');

    return res.json({ incidents });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch incidents.', error: error.message });
  }
}

async function adminUpdateIncident(req, res) {
  try {
    const { id } = req.params;
    const { adminId, status, approvalStatus, progressPercent, adminNote } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin identity is required.' });
    }

    const adminUser = await User.findById(adminId).select('role name status');
    if (!adminUser || adminUser.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admin can update incident progress.' });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    if (approvalStatus && !['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status selected.' });
    }

    if (status && !['Submitted', 'Approved', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid operational status selected.' });
    }

    const safeProgress = Number(progressPercent);
    if (Number.isNaN(safeProgress) || safeProgress < 0 || safeProgress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100.' });
    }

    incident.approvalStatus = approvalStatus || incident.approvalStatus;
    incident.status = status || incident.status;
    incident.progressPercent = safeProgress;
    incident.adminNote = (adminNote || '').trim();
    incident.updatedByAdmin = adminUser._id;
    incident.updatedByAdminName = adminUser.name;

    await incident.save();

    return res.json({
      message: `Incident "${incident.title}" updated successfully.`,
      incident,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update incident.', error: error.message });
  }
}

module.exports = {
  createIncident,
  listIncidents,
  adminUpdateIncident,
};
