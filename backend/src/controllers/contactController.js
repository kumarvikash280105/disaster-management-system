const ContactMessage = require('../models/ContactMessage');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function createContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All contact fields are required.' });
    }

    if (!emailRegex.test(email.toLowerCase().trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    await ContactMessage.create({ name, email, subject, message });

    return res.status(201).json({
      message: 'Your message has been saved. Our team will reach out soon.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit message.', error: error.message });
  }
}

module.exports = {
  createContactMessage,
};
