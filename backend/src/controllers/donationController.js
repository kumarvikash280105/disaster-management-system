const Donation = require('../models/Donation');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

async function createDonation(req, res) {
  try {
    const { donorName, email, phone, amount, purpose, message } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = phone?.replace(/\D/g, '');

    if (!donorName || !email || !phone || !amount || !purpose) {
      return res.status(400).json({ message: 'Name, email, phone, amount, and purpose are required.' });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    const donation = await Donation.create({
      donorName,
      email: normalizedEmail,
      phone: normalizedPhone,
      amount,
      purpose,
      message,
      paymentStatus: 'received',
    });

    return res.status(201).json({
      message: `Donation of INR ${donation.amount} received successfully.`,
      donation,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Donation could not be processed.', error: error.message });
  }
}

async function listDonations(req, res) {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('donorName amount purpose createdAt paymentStatus');

    const totalRaised = await Donation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return res.json({
      donations,
      totalRaised: totalRaised[0]?.total || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch donations.', error: error.message });
  }
}

module.exports = {
  createDonation,
  listDonations,
};
