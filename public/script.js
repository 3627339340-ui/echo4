// public/script.js
const envelopeContainer = document.getElementById("envelopeContainer");
const envelope = document.getElementById("envelope");
const inputCard = document.getElementById("inputCard");
const letterCard = document.getElementById("letterCard");
const messageInput = document.getElementById("messageInput");
const generateBtn = document.getElementById("generateBtn");
const letterContent = document.getElementById("letterContent");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const collapseBtn = document.getElementById("collapseBtn");
const starsContainer = document.getElementById("stars-container");
const floatingLights = document.getElementById("floatingLights");

const inboxButton = document.getElementById("inboxButton");
const inboxPanel = document.getElementById("inboxPanel");
const inboxList = document.getElementById("inboxList");
const closeInbox = document.getElementById("closeInbox");
const clearInboxBtn = document.getElementById("clearInboxBtn");
const weatherBtn = document.getElementById("weatherBtn");
const cityInput = document.getElementById("cityInput");

let utterance = null;

// background by time
function updateBackgroundByTime() {
  const h = new Date().getHours();
  let bg;
  if (h >= 5 && h < 8) bg = "linear-gradient(135deg,#FFE8D6,#FFD1DC)";
  else if (h >= 8 && h < 12) bg = "linear-gradient(135deg,#D4F1F9,#E2F0CB)";
  else if (h >= 12 && h < 16) bg = "linear-gradient(135deg,#C5E3F6,#DCD3F9)";
  else if (h >= 16 && h < 19) bg = "linear-gradient(135deg,#FEC5E5,#F8D6A3)";
  else if (h >= 19 && h < 22) bg = "linear-gradient(135deg,#A8BFFF,#D9A7FF)";
  else bg = "linear-gradient(135deg,#6A82FB,#3A1C71)";
  document.body.style.background = bg;
}
updateBackgroundByTime();
setInterval(updateBackgroundByTime, 60_000);

// stars & lights
function spawnStars(count = 48) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.width = (1 + Math.random() * 3) + "px";
    s.style.height = s.style.width;
    s.style.animationDelay = Math.random() * 3 + "s";
    starsContainer.appendChild(s);
  }
}
spawnStars(48);

function createFloatingLights(count = 4) {
  for (let i = 0; i < count; i++) {
    const l = document.createElement("div");
    l.className = "floating-light";
    l.style.width = (120 + Math.random() * 180) + "px";
    l.style.height = l.style.width;
    l.style.left = Math.random() * 100 + "%";
    l.style.top = Math.random() * 100 + "%";
    floatingLights.appendChild(l);
  }
}
createFloatingLights(4);

// envelope open
function openToInput() {
  envelopeContainer.style.opacity = "0";
  envelopeContainer.style.transition = "opacity 0.8s ease";
  setTimeout(() => {
    envelopeContainer.classList.add("hidden");
    inputCard.classList.remove("hidden");
    inputCard.classList.add("fade-in");
    messageInput.focus();
  }, 800);
}
envelope?.addEventListener("click", openToInput);
setTimeout(openToInput, 3000);

// API fetch for reply
async function fetchReply(message) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || res.statusText || "请求失败");
  }
  const data = await res.json();
  return data.reply;
}

// Inbox helpers
function loadLetters() {
  return JSON.parse(localStorage.getItem("futureEchoLetters") || "[]");
}
function saveLetterToInbox(content) {
  const arr = loadLetters();
  arr.unshift({ content, time: new Date().toISOString() });
  localStorage.setItem("futureEchoLetters", JSON.stringify(arr));
}
function renderInbox() {
  inboxList.innerHTML = "";
  const arr = loadLetters();
  if (!arr.length) {
    inboxList.innerHTML = `<p class="no-letters">暂无回信记录</p>`;
    return;
  }
  arr.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "inbox-item";
    div.innerHTML = `<strong>${new Date(it.time).toLocaleString()}</strong><div style="margin-top:6px;color:#333">${it.content.slice(0,120)}${it.content.length>120?"…":""}</div>`;
    div.addEventListener("click", () => {
      inboxPanel.classList.add("hidden");
      letterCard.classList.remove("hidden");
      letterCard.classList.add("fade-in");
      letterContent.textContent = it.content;
    });
    let pressTimer = null;
    div.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        if (confirm("确定删除这条回信？")) {
          const arr2 = loadLetters();
          arr2.splice(idx, 1);
          localStorage.setItem("futureEchoLetters", JSON.stringify(arr2));
          renderInbox();
        }
      }, 800);
    });
    div.addEventListener("touchend", () => clearTimeout(pressTimer));
    div.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => {
        if (confirm("确定删除这条回信？")) {
          const arr2 = loadLetters();
          arr2.splice(idx, 1);
          localStorage.setItem("futureEchoLetters", JSON.stringify(arr2));
          renderInbox();
        }
      }, 1000);
    });
    div.addEventListener("mouseup", () => clearTimeout(pressTimer));
    inboxList.appendChild(div);
  });
}
inboxButton?.addEventListener("click", () => {
  renderInbox();
  inboxPanel.classList.toggle("hidden");
});
closeInbox?.addEventListener("click", () => inboxPanel.classList.add("hidden"));
clearInboxBtn?.addEventListener("click", () => {
  if (confirm("确定清空所有回信记录？")) {
    localStorage.setItem("futureEchoLetters", JSON.stringify([]));
    renderInbox();
  }
});

// generate flow
generateBtn?.addEventListener("click", async () => {
  const txt = messageInput.value.trim();
  if (!txt) {
    alert("请输入你想对未来的自己的话。");
    return;
  }
  inputCard.classList.add("hidden");
  letterCard.classList.remove("hidden");
  letterCard.classList.add("fade-in");
  letterContent.textContent = "正在连接未来，请稍候……";
  try {
    const reply = await fetchReply(txt);
    letterContent.textContent = reply;
    saveLetterToInbox(reply);
  } catch (err) {
    console.error(err);
    letterContent.textContent = "生成失败，请稍后再试。";
  }
});

// TTS
playBtn?.addEventListener("click", () => {
  const text = letterContent.textContent;
  if (!text || /正在连接未来|生成失败/.test(text)) return;
  if (speechSynthesis.speaking) return;
  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 0.95;
  speechSynthesis.speak(utterance);
  playBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  utterance.onend = () => {
    playBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
  };
});
pauseBtn?.addEventListener("click", () => {
  speechSynthesis.cancel();
  playBtn.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
});
collapseBtn?.addEventListener("click", () => {
  speechSynthesis.cancel();
  letterCard.classList.add("hidden");
  inputCard.classList.remove("hidden");
  inputCard.classList.add("fade-in");
  messageInput.value = "";
  setTimeout(() => messageInput.focus(), 120);
});

// Weather integration
async function applyWeather(city = "") {
  try {
    let q = "";
    if (city) q = `?q=${encodeURIComponent(city)}`;
    else {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 8000 });
        }).catch(() => null);
        if (pos && pos.coords) q = `?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
      }
    }
    const res = await fetch("/api/weather" + q);
    if (!res.ok) throw new Error("weather api failed");
    const data = await res.json();
    const w = data.weather || {};
    const main = (w.main || "").toLowerCase();
    if (main.includes("rain")) {
      document.body.style.background = "linear-gradient(160deg,#dbe7f2,#c8dff0)";
    } else if (main.includes("cloud")) {
      document.body.style.background = "linear-gradient(160deg,#efeef2,#e9e6ea)";
    } else if (main.includes("snow")) {
      document.body.style.background = "linear-gradient(160deg,#eef6ff,#f2f6fb)";
    } else {
      updateBackgroundByTime();
    }
  } catch (err) {
    updateBackgroundByTime();
  }
}
weatherBtn?.addEventListener("click", () => applyWeather(cityInput.value.trim()));

// init
(function init() {
  spawnInitLog();
  spawnStars(48);
  createFloatingLights(4);
  updateBackgroundByTime();
  applyWeather();
  const hour = new Date().getHours();
  document.querySelectorAll(".star").forEach(s => s.style.opacity = (hour >= 19 || hour < 6) ? 0.45 : 0.18);
  setTimeout(openToInput, 3000);
})();
function spawnInitLog(){console.log("future-echo initialized");}


