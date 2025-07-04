let key = "b3367b05765144deb0a221308250207";
let baseUrl = "http://api.weatherapi.com/v1";

// ========== Start: DOM Elements ==========
const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
// ========== End: DOM Elements ==========

// ========== Start: Fetch Weather Function ==========
function fetchWeatherData(city) {
  const forecastUrl = `${baseUrl}/forecast.json?key=${key}&q=${encodeURIComponent(
    city
  )}&days=3`;

  fetch(forecastUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.location) {
        const current = data.current;
        const today = data.forecast.forecastday[0];

        // ========== Start: Day 1 ==========
        document.querySelector(
          ".today-card .header span:nth-child(1)"
        ).textContent = new Date(today.date).toLocaleDateString("en-US", {
          weekday: "long",
        });

        document.querySelector(
          ".today-card .header span:nth-child(2)"
        ).textContent = new Date(today.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });

        document.querySelector(".today-card h5").textContent =
          data.location.name;
        document.querySelector(
          ".today-card h1"
        ).textContent = `${current.temp_c}°C`;
        document.querySelector(
          ".today-card img"
        ).src = `https:${current.condition.icon}`;
        document.querySelector(".today-card p.text-primary").textContent =
          current.condition.text;

        const rain = `${today.day.daily_chance_of_rain}%`;
        const wind_kph = `${current.wind_kph} km/h`;
        const wind_dir = current.wind_dir;

        const footerSpans = document.querySelectorAll(
          ".today-card .content .d-flex span"
        );
        if (footerSpans.length === 3) {
          footerSpans[0].innerHTML = `<img src="Images/icon-umberella@2x.png" alt=""> ${rain}`;
          footerSpans[1].innerHTML = `<img src="Images/icon-compass@2x.png" alt=""> ${wind_kph}`;
          footerSpans[2].innerHTML = `<img src="Images/icon-wind@2x.png" alt=""> ${wind_dir}`;
        } else {
          console.warn("Footer spans not found or incomplete");
        }
        // ========== End: Day 1 ==========

        // ========== Start: Day 2 and 3 ==========
        for (let i = 1; i <= 2; i++) {
          const card = document.querySelector(`.day-${i + 1}`);
          const dayData = data.forecast.forecastday[i];

          card.querySelector(".header").textContent = new Date(
            dayData.date
          ).toLocaleDateString("en-US", {
            weekday: "long",
          });

          card.querySelector("h4").textContent = `${dayData.day.maxtemp_c}°C`;
          card.querySelector(
            ".text-secondary"
          ).textContent = `${dayData.day.mintemp_c}°C`;
          card.querySelector("p.text-primary").textContent =
            dayData.day.condition.text;
          card.querySelector("img").src = `https:${dayData.day.condition.icon}`;
        }
        // ========== End: Day 2 and 3 ==========
      } else {
        alert("No data found for this location.");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error fetching weather data.");
    });
}
window.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData("London");
});
// ========== End: Fetch Weather Function ==========

// ========== Start: Search Events ==========
searchBtn.addEventListener("click", function () {
  const city = input.value.trim();
  if (city !== "") {
    fetchWeatherData(city);
  }
});

input.addEventListener("input", function () {
  const city = input.value.trim();
  if (city.length >= 2) {
    fetch(`${baseUrl}/search.json?key=${key}&q=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          fetchWeatherData(data[0].name);
        }
      });
  }
});
// ========== End: Search Events ==========

// ========== Start: Navbar Active Handler ==========
const path = window.location.pathname;

if (path.includes("index.html") || path === "/") {
  document.getElementById("nav-home")?.classList.add("active");
} else if (path.includes("contact.html")) {
  document.getElementById("nav-contact")?.classList.add("active");
}
// ========== End: Navbar Active Handler ==========
