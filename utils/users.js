const bcrypt = require('bcryptjs');

let users = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@fintrust.com',
    password: bcrypt.hashSync('SecureAdmin2025!', 12),
    isAdmin: true,
    isFrozen: false,
    investments: 0,
    loans: 0,
    createdAt: new Date().toISOString()
  }
];

const addUser = (userData) => {
  const user = {
    id: `user-${Date.now()}`,
    ...userData,
    password: bcrypt.hashSync(userData.password, 12),
    isAdmin: false,
    isFrozen: false,
    investments: 0,
    loans: 0,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
};

const findUserByEmail = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id === id);
const getAllUsers = () => users.filter(u => !u.isAdmin);
const toggleUserFrozenStatus = (id) => {
  const user = findUserById(id);
  if (user) {
    user.isFrozen = !user.isFrozen;
    return user;
  }
  return null;
};

module.exports = { addUser, findUserByEmail, findUserById, getAllUsers, toggleUserFrozenStatus };
