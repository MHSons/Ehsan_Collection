/* auth.js
   Client-side authentication helpers.
   - Uses Web Crypto API SHA-256 to hash passwords (not a replacement for server hashing).
   - Stores users in localStorage under key 'ecom_users_v1'
   - Stores session token in localStorage 'ecom_session'
   - Supports simple role: 'user' | 'admin'
*/

const Auth = (() => {
  const USERS_KEY = 'ecom_users_v1';
  const SESSION_KEY = 'ecom_session';
  const SALT = 'ecom_salt_v1'; // client-side salt for hashing (change if migrating)

  // Helpers
  async function sha256(str) {
    const enc = new TextEncoder();
    const buf = enc.encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function writeUsers(arr) {
    localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  }

  async function register({ name, email, password, role = 'user' }) {
    if (!email || !password || !name) throw new Error('Missing fields');
    const users = readUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('Email already registered');
    const hash = await sha256(SALT + password);
    const user = {
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      role,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeUsers(users);
    // auto login
    setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    return user;
  }

  async function login({ email, password }) {
    if (!email || !password) throw new Error('Missing fields');
    const users = readUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    const hash = await sha256(SALT + password);
    if (hash !== user.passwordHash) throw new Error('Invalid credentials');
    setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    return user;
  }

  function setSession(payload) {
    const token = {
      user: payload,
      issuedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(token));
    // notify other tabs
    localStorage.setItem('ecom_session_change', Date.now().toString());
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem('ecom_session_change', Date.now().toString());
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function requireAuth(redirectTo = 'login.html') {
    const s = getSession();
    if (!s) {
      window.location.href = redirectTo;
      return null;
    }
    return s.user;
  }

  function isAdmin() {
    const s = getSession();
    return s && s.user && s.user.role === 'admin';
  }

  // Expose
  return {
    register,
    login,
    logout,
    getSession,
    requireAuth,
    isAdmin,
    _readUsers: readUsers,
    _writeUsers: writeUsers
  };
})();
