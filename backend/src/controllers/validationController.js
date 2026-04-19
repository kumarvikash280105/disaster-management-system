const User = require('../models/User');

async function getPendingAuthorities(req, res) {
  try {
    const pendingAuthorities = await User.find({
      role: 'Authority',
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .select('name role location status createdAt');

    return res.json({ pendingAuthorities });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load validation queue.', error: error.message });
  }
}

async function approveAuthority(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).select('name role location status');

    if (!user) {
      return res.status(404).json({ message: 'Authority profile not found.' });
    }

    return res.json({
      message: `${user.name} validated successfully.`,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to validate authority.', error: error.message });
  }
}

module.exports = {
  getPendingAuthorities,
  approveAuthority,
};
