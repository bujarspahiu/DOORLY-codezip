export interface StoredUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'admin' | 'business';
  plan: string;
  status: 'active' | 'suspended';
  companyName: string;
  createdAt: string;
}

const STORAGE_KEY = 'doorly_users';

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'admin',
    fullName: 'Super Admin',
    email: 'admin@doorly.com',
    role: 'admin',
    plan: 'enterprise',
    status: 'active',
    companyName: 'Doorly Platform',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-001',
    username: 'demo',
    password: 'demo',
    fullName: 'Demo User',
    email: 'demo@doorly.com',
    role: 'business',
    plan: 'professional',
    status: 'active',
    companyName: 'Demo Windows & Doors',
    createdAt: new Date().toISOString(),
  },
];

function getUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function authenticateUser(username: string, password: string): StoredUser | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user && user.status === 'active') return user;
  if (user && user.status === 'suspended') return null;
  return null;
}

export function getAllBusinessUsers(): StoredUser[] {
  return getUsers().filter(u => u.role === 'business');
}

export function getAllUsers(): StoredUser[] {
  return getUsers();
}

export function createUser(data: { username: string; password: string; fullName: string; companyName: string; plan: string }): StoredUser {
  const users = getUsers();
  if (users.find(u => u.username === data.username)) {
    throw new Error('Username already exists');
  }
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    username: data.username,
    password: data.password,
    fullName: data.fullName,
    email: `${data.username}@doorly.com`,
    role: 'business',
    plan: data.plan,
    status: 'active',
    companyName: data.companyName,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].status = status;
    saveUsers(users);
  }
}

export function deleteUserById(userId: string) {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
}

export function getUserById(userId: string): StoredUser | null {
  return getUsers().find(u => u.id === userId) || null;
}
