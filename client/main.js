import bot from './assets/aleph.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const textarea = document.querySelector("input[type=text]");
const suggestion1 = document.querySelector('#suggestion1');
const suggestion2 = document.querySelector('#suggestion2');
const suggestion3 = document.querySelector('#suggestion3');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval  = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }

    else {
      clearInterval(interval);
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id=${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src=${isAi ? bot : user}
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

async function handleSubmit(event) {
  event.preventDefault();

  infoScreen.style.display = "none";
  const data  = new FormData(form);

  // User Chat Stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // Bot Chat Stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);
  window.scrollTo(0, document.body.scrollHeight);

  // Fetch data from the server (Bot's response)
  const response = await fetch('https://alephopenai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  }

  else {
    const err = response.text();
    messageDiv.innerHTML = "Something went wrong. Please try again!";
    alert(err);
  }
}

const handleSuggestion = function (num) {
  return function (event) {
    event.preventDefault();
    textarea.value = document.querySelector(`#suggestion${num} p`).innerHTML.replace(/"/g, '').slice(0, -1);
  };
};

suggestion1.addEventListener('click', handleSuggestion(1));
suggestion2.addEventListener('click', handleSuggestion(2));
suggestion3.addEventListener('click', handleSuggestion(3));
form.addEventListener('submit', handleSubmit);