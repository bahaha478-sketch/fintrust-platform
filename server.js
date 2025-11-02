require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail, getAllUsers, toggleUserFrozenStatus } = require('./utils/users');
const { protect } = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

const generateToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

app.get('/', (req, res) => {
  res.json({ message: 'FinTrust API Live ✅', admin: 'admin@fintrust.com' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (findUserByEmail(email)) return res.status(400).json({ message: 'User exists' });
    const user = addUser({ name, email, password });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
    const user = findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isFrozen) return res.status(403).json({ message: 'Account frozen' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ _id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user.id, user.isAdmin) });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/profile', protect, (req, res) => {
  res.json({ _id: req.user.id, name: req.user.name, email: req.user.email, investments: req.user.investments, loans: req.user.loans });
});

app.get('/api/admin/users', protect, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  res.json(getAllUsers());
});

app.put('/api/admin/users/:id/freeze', protect, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  const user = toggleUserFrozenStatus(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `User ${user.isFrozen ? 'frozen' : 'unfrozen'}`, user: { id: user.id, isFrozen: user.isFrozen } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Live on port ${PORT}`));
