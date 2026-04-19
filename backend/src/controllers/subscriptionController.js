const Subscription = require('../models/Subscription');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function createSubscription(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!emailRegex.test(email.toLowerCase().trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const existing = await Subscription.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({ message: 'This email is already subscribed.' });
    }

    await Subscription.create({ email });

    return res.status(201).json({
      message: 'Subscribed successfully for alerts and updates.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Subscription failed.', error: error.message });
  }
}

module.exports = {
  createSubscription,
};
