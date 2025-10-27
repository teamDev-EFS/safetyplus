export function Toaster() {
  return <div id="toast-container" className="fixed bottom-4 right-4 z-50 space-y-2"></div>;
}

export function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-x-0 opacity-100 ${
    type === 'success' ? 'bg-green-600 text-white' :
    type === 'error' ? 'bg-red-600 text-white' :
    'bg-gray-900 text-white'
  }`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}
