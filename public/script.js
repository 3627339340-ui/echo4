const envelope = document.getElementById("envelope");
const mainContent = document.getElementById("mainContent");
const weatherDisplay = document.getElementById("weatherDisplay");
const refreshWeather = document.getElementById("refreshWeather");

// ✉️ 信封3秒后展开输入界面
setTimeout(() => {
  envelope.style.display = "none";
  mainContent.style.display = "flex";
}, 3000);

// 🌤 获取天气
async function loadWeather() {
  try {
    const res = await fetch("/weather");
    const data = await res.json();
    const weather = data.now.text;
    const temp = data.now.temp;
    weatherDisplay.textContent = `${weather} | ${temp}°C`;
  } catch (err) {
    weatherDisplay.textContent = "天气加载失败";
  }
}
refreshWeather.addEventListener("click", loadWeather);
loadWeather();

// 🌞 动态背景根据时间变化
function updateBackground() {
  const hour = new Date().getHours();
  const bg = document.getElementById("background");
  if (hour >= 6 && hour < 18) {
    bg.style.background = "radial-gradient(circle at center, #89f7fe, #66a6ff)";
  } else {
    bg.style.background = "radial-gradient(circle at center, #141E30, #243B55)";
  }
}
updateBackground();
setInterval(updateBackground, 60000);
