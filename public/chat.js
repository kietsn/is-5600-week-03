new window.EventSource('/sse').onmessage = function (event) {
  window.messages.innerHTML += `<p>${event.data}</p>`;
};

window.form.addEventListener('submit', function (event) {
  event.preventDefault();

  const message = window.input.value.trim();
  if (!message) return;

  window.fetch(`/chat?message=${encodeURIComponent(message)}`);
  window.input.value = '';
});