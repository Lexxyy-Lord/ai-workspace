const state = {
  messages: [],
  config: null,
};

const elements = {
  appTitle: document.querySelector('#app-title'),
  appDescription: document.querySelector('#app-description'),
  providerStatus: document.querySelector('#provider-status'),
  model: document.querySelector('#model'),
  temperature: document.querySelector('#temperature'),
  maxTokens: document.querySelector('#maxTokens'),
  system: document.querySelector('#system'),
  messages: document.querySelector('#messages'),
  form: document.querySelector('#chat-form'),
  message: document.querySelector('#message'),
  sendButton: document.querySelector('#send-button'),
  clearChat: document.querySelector('#clear-chat'),
};

const appendMessage = (role, content) => {
  const item = document.createElement('article');
  item.className = `message ${role}`;
  item.textContent = content;
  elements.messages.append(item);
  elements.messages.scrollTop = elements.messages.scrollHeight;
};

const setLoading = (isLoading) => {
  elements.sendButton.disabled = isLoading;
  elements.sendButton.textContent = isLoading ? 'Mengirim...' : 'Kirim';
};

const loadConfig = async () => {
  const response = await fetch('/api/config');
  const config = await response.json();
  state.config = config;

  document.title = config.appTitle;
  elements.appTitle.textContent = config.appTitle;
  elements.appDescription.textContent = config.appDescription;
  elements.model.value = config.defaultModel;
  elements.temperature.value = config.defaultTemperature;
  elements.maxTokens.value = config.defaultMaxTokens;

  elements.providerStatus.textContent = config.providerConfigured
    ? 'Provider siap digunakan'
    : 'API key belum diatur di .env';
  elements.providerStatus.classList.toggle('ready', config.providerConfigured);
  elements.providerStatus.classList.toggle('warning', !config.providerConfigured);
};

const submitChat = async (event) => {
  event.preventDefault();

  const message = elements.message.value.trim();

  if (!message) {
    return;
  }

  appendMessage('user', message);
  state.messages.push({ role: 'user', content: message });
  elements.message.value = '';
  setLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        messages: state.messages.slice(0, -1),
        system: elements.system.value.trim() || undefined,
        model: elements.model.value.trim() || undefined,
        temperature: Number(elements.temperature.value),
        maxTokens: Number(elements.maxTokens.value),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Gagal mendapatkan respons AI.');
    }

    const answer = payload.message || '(Respons kosong dari provider)';
    appendMessage('assistant', answer);
    state.messages.push({ role: 'assistant', content: answer });
  } catch (error) {
    appendMessage('error', error.message);
  } finally {
    setLoading(false);
  }
};

const clearChat = () => {
  state.messages = [];
  elements.messages.innerHTML = '';
  appendMessage('assistant', 'Chat dibersihkan. Silakan mulai percakapan baru.');
};

elements.form.addEventListener('submit', submitChat);
elements.clearChat.addEventListener('click', clearChat);

loadConfig().catch((error) => {
  elements.providerStatus.textContent = 'Gagal memuat konfigurasi';
  elements.providerStatus.classList.add('warning');
  appendMessage('error', error.message);
});

appendMessage('assistant', 'Halo! Isi API key di .env, lalu mulai bertanya di sini.');
