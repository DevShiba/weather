const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");

const apiKey = "0d829c2ce3b8264e252e6d0661d23ed7";

let itemsArray = localStorage.getItem("weather")
  ? JSON.parse(localStorage.getItem("weather"))
  : [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let inputValue = input.value.trim();

  if (!inputValue) {
    displayErrorMessage("Please enter a city name or country!");
    return;
  }

  msg.textContent = "";

  const existingCity = itemsArray.find(
    (item) => item.city.toLowerCase() === inputValue.toLowerCase()
  );

  if (existingCity) {
    displayErrorMessage(
      `You already know the weather for ${existingCity.city}!`
    );
    form.reset();
    input.focus();
    return;
  }

  try {
    const data = await fetchWeatherData(inputValue);
    const cityMarkup = createCityMarkup(data);

    const newCityData = {
      city: data.name,
      country: data.sys.country,
      cityMarkup,
    };
    itemsArray.push(newCityData);
    localStorage.setItem("weather", JSON.stringify(itemsArray));

    addCityToDOM(newCityData);

    form.reset();
    input.focus();
  } catch (error) {
    displayErrorMessage(
      error.message || "Something went wrong. Please try again later."
    );
  }
});

async function fetchWeatherData(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("City not found or API request failed!");
  }

  return response.json();
}

function createCityMarkup(data) {
  const { main, name, sys, weather } = data;
  const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
  return `
    <h2 class="city-name" data-name="${name},${sys.country}">
      <span>${name}</span>
      <sup>${sys.country}</sup>
    </h2>
    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
    <figure>
      <img class="city-icon" src="${icon}" alt="${weather[0]["description"]}">
      <figcaption>${weather[0]["description"]}</figcaption>
    </figure>
  `;
}

function addCityToDOM(cityData) {
  const li = document.createElement("li");
  li.classList.add("city");
  li.innerHTML = cityData.cityMarkup;
  list.appendChild(li);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("weather-delete");
  deleteBtn.textContent = "Delete";
  li.appendChild(deleteBtn);

  deleteBtn.addEventListener("click", () => {
    deleteCity(cityData.city, cityData.country);
  });
}

function deleteCity(cityName, countryName) {
  itemsArray = itemsArray.filter(
    (item) => !(item.city === cityName && item.country === countryName)
  );
  localStorage.setItem("weather", JSON.stringify(itemsArray));
  displayItemsFromLocalStorage();
}

function displayItemsFromLocalStorage() {
  list.innerHTML = "";
  itemsArray.forEach(addCityToDOM);
}

function displayErrorMessage(message) {
  msg.textContent = message;
}

window.onload = function () {
  displayItemsFromLocalStorage();
};
