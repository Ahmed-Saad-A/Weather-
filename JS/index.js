const API_KEY = "b3367b05765144deb0a221308250207";
const BASE_URL = "https://api.weatherapi.com/v1";
const DEFAULT_CITY = "London";
const MIN_SEARCH_CHARS = 2;
const TYPEAHEAD_DELAY = 600;

// ========== Start: DOM Elements ==========
const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const todayCard = document.querySelector(".today-card");
const nextDayCards = [document.querySelector(".day-2"), document.querySelector(".day-3")];
const todayHeaderPrimary = todayCard?.querySelector(".header span:nth-child(1)");
const todayHeaderSecondary = todayCard?.querySelector(".header span:nth-child(2)");
const todayLocation = todayCard?.querySelector("h5");
const todayTemperature = todayCard?.querySelector("h1");
const todayIcon = todayCard?.querySelector("img");
const todayCondition = todayCard?.querySelector("p.text-primary");
const todayFooterSpans = todayCard?.querySelectorAll(".content .d-flex span");
// ========== End: DOM Elements ==========

let debounceTimer = null;
let originalBtnText = searchBtn?.textContent ?? "Find";

function setButtonLoading(isLoading) {
  if (!searchBtn) return;
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Loading..." : originalBtnText;
}

function formatDate(dateStr, options) {
  return new Date(dateStr).toLocaleDateString("en-US", options);
}

function displayError(message) {
  if (todayLocation) todayLocation.textContent = "Unable to load weather";
  if (todayTemperature) todayTemperature.textContent = "-- °C";
  if (todayCondition) todayCondition.textContent = message;
  alert(message);
}

function renderTodayCard(location, current, today) {
  if (!todayCard) return;
  if (todayHeaderPrimary)
    todayHeaderPrimary.textContent = formatDate(today.date, { weekday: "long" });
  if (todayHeaderSecondary)
    todayHeaderSecondary.textContent = formatDate(today.date, {
      day: "numeric",
      month: "short",
    });
  if (todayLocation) todayLocation.textContent = location.name;
  if (todayTemperature) todayTemperature.textContent = `${current.temp_c}°C`;
  if (todayIcon) todayIcon.src = `https:${current.condition.icon}`;
  if (todayCondition) todayCondition.textContent = current.condition.text;

  if (todayFooterSpans?.length === 3) {
    const rain = `${today.day.daily_chance_of_rain ?? 0}%`;
    const windKph = `${current.wind_kph ?? 0} km/h`;
    const windDir = current.wind_dir ?? "N/A";
    todayFooterSpans[0].innerHTML = `<img src="Images/icon-umberella@2x.png" alt=""> ${rain}`;
    todayFooterSpans[1].innerHTML = `<img src="Images/icon-compass@2x.png" alt=""> ${windKph}`;
    todayFooterSpans[2].innerHTML = `<img src="Images/icon-wind@2x.png" alt=""> ${windDir}`;
  } else {
    console.warn("Weather footer spans missing, skipping footer update.");
  }
}

function renderNextDays(forecastDays) {
  nextDayCards.forEach((card, idx) => {
    if (!card || !forecastDays[idx + 1]) return;
    const dayData = forecastDays[idx + 1];
    const header = card.querySelector(".header");
    const maxTemp = card.querySelector("h4");
    const minTemp = card.querySelector(".text-secondary");
    const condition = card.querySelector("p.text-primary");
    const icon = card.querySelector("img");

    if (header)
      header.textContent = formatDate(dayData.date, { weekday: "long" });
    if (maxTemp) maxTemp.textContent = `${dayData.day.maxtemp_c}°C`;
    if (minTemp) minTemp.textContent = `${dayData.day.mintemp_c}°C`;
    if (condition) condition.textContent = dayData.day.condition.text;
    if (icon) icon.src = `https:${dayData.day.condition.icon}`;
  });
}

async function fetchWeatherData(city) {
  const trimmedCity = city?.trim();
  if (!trimmedCity) {
    displayError("Please type a city name first.");
    return;
  }

  try {
    setButtonLoading(true);
    const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
      trimmedCity
    )}&days=3`;

    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error(`Weather API failed (${response.status})`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "Weather API returned an error");
    }

    const forecastDays = data?.forecast?.forecastday;
    if (!data.location || !data.current || !forecastDays?.length) {
      throw new Error("Incomplete weather data received.");
    }

    renderTodayCard(data.location, data.current, forecastDays[0]);
    renderNextDays(forecastDays);
  } catch (error) {
    console.error("Weather fetch failed:", error);
    displayError(error.message || "Error fetching weather data.");
  } finally {
    setButtonLoading(false);
  }
}

async function fetchSuggestedCity(query) {
  try {
    const url = `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Suggestion API failed (${response.status})`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      await fetchWeatherData(data[0].name);
    }
  } catch (error) {
    console.error("City suggestion failed:", error);
  }
}

function initSearchHandlers() {
  if (!input || !searchBtn) {
    console.warn("Search elements not found. Weather search disabled.");
    return;
  }

  searchBtn.addEventListener("click", () => fetchWeatherData(input.value));
  input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") fetchWeatherData(input.value);
  });

  input.addEventListener("input", () => {
    const city = input.value.trim();
    if (city.length < MIN_SEARCH_CHARS) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestedCity(city), TYPEAHEAD_DELAY);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initSearchHandlers();
  fetchWeatherData(DEFAULT_CITY);
});
// ========== End: Fetch Weather Function ==========

// ========== Start: Navbar Active Handler ==========
const path = window.location.pathname;

if (path.includes("index.html") || path === "/") {
  document.getElementById("nav-home")?.classList.add("active");
} else if (path.includes("contact.html")) {
  document.getElementById("nav-contact")?.classList.add("active");
}
// ========== End: Navbar Active Handler ==========
