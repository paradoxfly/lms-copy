// sidebar.js

document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }
});

function showLogoutModal() {
  if (document.getElementById('logoutModal')) return;
  const modal = document.createElement('div');
  modal.id = 'logoutModal';
  modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
      <h2 class="text-xl font-semibold mb-4">Logout</h2>
      <p class="mb-6">Are you sure you want to logout?</p>
      <div class="flex gap-4 justify-center">
        <button id="confirmLogout" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Logout</button>
        <button onclick="closeLogoutModal()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('confirmLogout').onclick = async () => {
    try {
      const res = await fetch('/user/logout', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to logout');
      showSidebarToast('Logged out successfully');
      setTimeout(() => { window.location.href = '/login'; }, 1000);
    } catch (err) {
      showSidebarToast(err.message, 'error');
    }
  };
}
function closeLogoutModal() {
  document.getElementById('logoutModal').remove();
}

function showSidebarToast(message, type = 'success') {
  let toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
} 