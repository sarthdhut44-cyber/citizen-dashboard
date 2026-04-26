import './style.css';
import { fetchWeather, fetchCurrency, fetchCitizen, fetchFact, sendMessageToAI } from './api.js';

// Global Data Storage
window.globalData = {
  weather: null,
  currency: null,
  citizen: null,
  fact: null,
};

// UI Update Functions
const updateWeatherUI = () => {
  const container = document.getElementById('weather-content');
  if (!window.globalData.weather) {
    container.innerHTML = '<p class="error">Failed to load weather.</p>';
    return;
  }
  const { temp, wind, condition } = window.globalData.weather;
  container.innerHTML = `
    <div class="weather-main">
      <div class="temp"><span class="temp-val">${temp}</span><span class="unit">°C</span></div>
      <p class="weather-desc">Wind: ${wind} km/h</p>
      <p class="weather-meta">Code: ${condition}</p>
    </div>
  `;
};

const updateCurrencyUI = () => {
  const container = document.getElementById('currency-content');
  if (!window.globalData.currency) {
    container.innerHTML = '<p class="error">Failed to load currency rates.</p>';
    return;
  }
  const { rates, base } = window.globalData.currency;
  container.innerHTML = `
    <ul class="currency-list">
      <li class="currency-item"><span>1 ${base} to EUR</span> <span>${rates.EUR.toFixed(2)}</span></li>
      <li class="currency-item"><span>1 ${base} to GBP</span> <span>${rates.GBP.toFixed(2)}</span></li>
      <li class="currency-item"><span>1 ${base} to INR</span> <span>${rates.INR.toFixed(2)}</span></li>
      <li class="currency-item"><span>1 ${base} to JPY</span> <span>${rates.JPY.toFixed(2)}</span></li>
    </ul>
  `;
};

const updateCitizenUI = () => {
  const container = document.getElementById('citizen-content');
  if (!window.globalData.citizen) {
    container.innerHTML = '<p class="error">Failed to load citizen data.</p>';
    return;
  }
  const { name, email, location, picture } = window.globalData.citizen;
  container.innerHTML = `
    <div class="citizen-info">
      <img src="${picture}" alt="${name}" class="citizen-img">
      <div class="citizen-details">
        <h3>${name}</h3>
        <p>${email}</p>
        <p>${location}</p>
      </div>
    </div>
  `;
};

const updateFactUI = () => {
  const container = document.getElementById('fact-content');
  if (!window.globalData.fact) {
    container.innerHTML = '<p class="error">Failed to load fact.</p>';
    return;
  }
  container.innerHTML = `<p class="fact-text">"${window.globalData.fact.text}"</p>`;
};

// Fetch Handlers
const refreshWeather = async () => {
  document.getElementById('weather-content').innerHTML = '<div class="loader"></div>';
  window.globalData.weather = await fetchWeather();
  updateWeatherUI();
};

const refreshCurrency = async () => {
  document.getElementById('currency-content').innerHTML = '<div class="loader"></div>';
  window.globalData.currency = await fetchCurrency();
  updateCurrencyUI();
};

const refreshCitizen = async () => {
  document.getElementById('citizen-content').innerHTML = '<div class="loader"></div>';
  window.globalData.citizen = await fetchCitizen();
  updateCitizenUI();
};

const refreshFact = async () => {
  document.getElementById('fact-content').innerHTML = '<div class="loader"></div>';
  window.globalData.fact = await fetchFact();
  updateFactUI();
};

// Chat Logic
const addMessage = (text, sender) => {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const handleChat = async () => {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  input.value = '';

  const typingMsg = document.createElement('div');
  typingMsg.className = 'message bot typing';
  typingMsg.textContent = 'Neo-AI is thinking...';
  document.getElementById('chat-messages').appendChild(typingMsg);

  const response = await sendMessageToAI(message, window.globalData);
  
  typingMsg.remove();
  addMessage(response, 'bot');
};

// Initialize
const init = async () => {
  // Set up event listeners
  document.getElementById('refresh-weather').addEventListener('click', refreshWeather);
  document.getElementById('refresh-currency').addEventListener('click', refreshCurrency);
  document.getElementById('refresh-citizen').addEventListener('click', refreshCitizen);
  document.getElementById('refresh-fact').addEventListener('click', refreshFact);

  // Chat widget listeners
  const chatWidget = document.getElementById('chat-widget');
  document.getElementById('chat-toggle').addEventListener('click', () => {
    chatWidget.classList.replace('chat-closed', 'chat-open');
  });
  document.getElementById('chat-close').addEventListener('click', () => {
    chatWidget.classList.replace('chat-open', 'chat-closed');
  });
  document.getElementById('chat-send').addEventListener('click', handleChat);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
  });

  // Initial Fetches
  await Promise.all([
    refreshWeather(),
    refreshCurrency(),
    refreshCitizen(),
    refreshFact()
  ]);
};

document.addEventListener('DOMContentLoaded', init);
