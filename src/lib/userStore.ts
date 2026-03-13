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

const API_BASE = '/api';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export async function authenticateUser(username: string, password: string): Promise<StoredUser | null> {
  try {
    const user = await apiFetch<StoredUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return user;
  } catch {
    return null;
  }
}

export async function getAllBusinessUsers(): Promise<StoredUser[]> {
  return apiFetch<StoredUser[]>('/users/business');
}

export async function getAllUsers(): Promise<StoredUser[]> {
  return apiFetch<StoredUser[]>('/users');
}

export async function getUserById(userId: string): Promise<StoredUser | null> {
  try {
    return await apiFetch<StoredUser>(`/users/${userId}`);
  } catch {
    return null;
  }
}

export async function createUser(data: { username: string; password: string; fullName: string; companyName: string; plan: string }): Promise<StoredUser> {
  return apiFetch<StoredUser>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
  await apiFetch(`/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteUserById(userId: string): Promise<void> {
  await apiFetch(`/users/${userId}`, { method: 'DELETE' });
}
