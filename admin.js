/* admin.js - simple admin login handling (localStorage) */
const KEY_ADMINS = 'ehsan_admins_v1';

// If no admin list exists, keep default created in main.js, but ensure default present:
if(!localStorage.getItem(KEY_ADMINS)) localStorage.setItem(KEY_ADMINS, JSON.stringify([{username:'admin', password:'admin123', role:'super'}]));

document.getElementById('admin-login').addEventListener('submit', function(e){
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const admins = JSON.parse(localStorage.getItem(KEY_ADMINS) || '[]');
  const match = admins.find(a => a.username === u && a.password === p);
  if(match){
    // set logged flag
    localStorage.setItem('ehsan_admin_logged', JSON.stringify({ username: match.username, role: match.role }));
    // redirect to dashboard
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('error').classList.remove('hidden');
  }
});
