const bcrypt = require('bcryptjs');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

async function signup(req, res) {
  try {
    const { role, name, email, phone, location, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = phone?.replace(/\D/g, '');

    if (!role || !name || !email || !phone || !location || !password) {
      return res.status(400).json({ message: 'All signup fields are required.' });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });
    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === normalizedEmail
            ? 'An account with this email already exists.'
            : 'An account with this phone number already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      role,
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      location,
      passwordHash,
      status: role === 'Authority' ? 'pending' : 'approved',
    });

    return res.status(201).json({
      message:
        role === 'Authority'
          ? 'Authority account created and sent for admin validation.'
          : 'Account created successfully.',
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const normalizedIdentifier = identifier?.trim();
    const isEmailIdentifier = normalizedIdentifier?.includes('@');

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({ message: 'Email or phone number and password are required.' });
    }

    if (isEmailIdentifier && !emailRegex.test(normalizedIdentifier.toLowerCase())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!isEmailIdentifier && !phoneRegex.test(normalizedIdentifier.replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    const user = await User.findOne(
      isEmailIdentifier
        ? { email: normalizedIdentifier.toLowerCase() }
        : { phone: normalizedIdentifier.replace(/\D/g, '') }
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: 'No account found with this email or phone number. Please sign up first.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    return res.json({
      message:
        user.status === 'pending'
          ? 'Logged in. Your authority profile is awaiting admin validation.'
          : 'Login successful.',
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
}

module.exports = {
  signup,
  login,
};
