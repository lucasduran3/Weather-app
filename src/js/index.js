import { format } from "date-fns";
import "../css/meyerReset.css";
import "../css/style.css";

const UIController = () => {
  const searchField = document.getElementById("location");
  const date = document.querySelector(".date");
  const time = document.querySelector(".time");
  const temp = document.querySelector(".temp");
  const precip = document.querySelector(".precip");
  const humidity = document.querySelector(".humidity");
  const wind = document.querySelector(".wind");
  const bgImage = document.querySelector(".bg-img");
  const tempIcon = document.querySelector(".temp-icon");

  let selectedWeather;
  let switchStatus = "c";

  const setupListeners = () => {
    searchField.addEventListener("input", (e) => {
      if (e.target.value !== "") renderSearchList(e.target.value);
    });

    temp.addEventListener("click", () => {
      switchUnits();
    });
  };

  const clearContainer = (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const renderSearchList = async (input) => {
    const searchField = document.getElementById("location");
    const listContainer = document.getElementById("list-container");
    const locationsArray = await requests().searchLocation(input);
    if (input.length >= 3 && locationsArray.length !== 0) {
      clearContainer(listContainer);
      locationsArray.forEach((element) => {
        const listItem = document.createElement("div");
        listItem.classList.add("list-item");
        listItem.textContent = `${element.name}, ${element.country}`;
        listItem.addEventListener("click", async () => {
          searchField.blur();
          listContainer.classList.toggle("show");
          selectedWeather = await requests().weather(listItem.textContent);
          updateScreen();
        });
        listContainer.appendChild(listItem);
        listContainer.classList.add("show");
      });
    } else {
      listContainer.classList.remove("show");
    }
  };

  const imagePicker = () => {
    const weatherConditions = [
      {
        icon: "clear",
        text: "Clear sky",
        codes: [1000],
      },
      {
        icon: "cloudy",
        text: "Cloudy day",
        codes: [1036, 1006, 1003],
      },
      {
        icon: "overcast",
        text: "Overcast",
        codes: [1009],
      },
      {
        icon: "mist",
        text: "Misty air",
        codes: [1030],
      },
      {
        icon: "rain",
        text: "Rainy day",
        codes: [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243],
      },
      {
        icon: "snow",
        text: "Snowy day",
        codes: [1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258],
      },
      {
        icon: "sleet",
        text: "Freezing",
        codes: [1069, 1204, 1207, 1249, 1252],
      },
      {
        icon: "drizzle",
        text: "Drizzle",
        codes: [1272, 1150, 1153, 1168, 1171],
      },
      {
        icon: "thunder",
        text: "Thunders",
        codes: [1087, 1246, 1273, 1276, 1279, 1282],
      },
      {
        icon: "snow-wind",
        text: "Blizzard",
        codes: [1114, 1117],
      },
      {
        icon: "fog",
        text: "Foggy day",
        codes: [1135, 1147],
      },
      {
        icon: "snow-rain",
        text: "Freezing",
        codes: [1198, 1201],
      },
      {
        icon: "hail",
        text: "Hail storm",
        codes: [1237, 1261, 1264],
      },
    ];

    const iconCode = selectedWeather.current.condition.code;
    const isDay = selectedWeather.current.is_day;
    const iconName = weatherConditions.find((item) =>
      item.codes.includes(iconCode)
    );
    let image;
    image = isDay === 0 ? `${iconName.icon}-night` : `${iconName.icon}-day`;

    return { image };
  };

  const switchUnits = () => {
    switchStatus = switchStatus === "c" ? "f" : "c";
    if (switchStatus === "f") {
      temp.textContent = `${selectedWeather.current.temp_f} °F`;
      precip.textContent = `${selectedWeather.current.precip_mm} mm`;
      wind.textContent = `${selectedWeather.current.wind_mph} mph`;
    } else if (switchStatus == "c") {
      temp.textContent = `${selectedWeather.current.temp_c} °C`;
      precip.textContent = `${selectedWeather.current.precip_in} in`;
      wind.textContent = `${selectedWeather.current.wind_kph} kph`;
    }
  };

  const updateScreen = () => {
    searchField.value = `${selectedWeather.location.name}, ${selectedWeather.location.country}`;
    const dayDate = selectedWeather.location.localtime.split(" ")[0].split("-");
    const timeDate = selectedWeather.location.localtime.split(" ")[1];
    time.textContent = timeDate;
    date.textContent = format(new Date(dayDate), "eeeeeee");
    humidity.textContent = `${selectedWeather.current.humidity} %`;
    const imageName = imagePicker().image;
    bgImage.src = `./images/${imageName}.jpg` || "./images/clear-day.jpg";
    tempIcon.src = `./icons/${imageName}.svg`;
    temp.textContent = `${selectedWeather.current.temp_c} °C`;
    precip.textContent = `${selectedWeather.current.precip_in} in`;
    wind.textContent = `${selectedWeather.current.wind_kph} kph`;
  };

  const init = async () => {
    selectedWeather = await requests().weather("rafaela, argentina");
    updateScreen();
    setupListeners();
  };

  return { init, updateScreen };
};

const requests = () => {
  const weather = async (location) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=5238ad1040f54b49b91141201241502 &q=${location}&aqi=yes`,{
          mode: "cors"
        }
      );
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.log(error);
    }
  };

  const searchLocation = async (input) => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?q=${input}&key=5238ad1040f54b49b91141201241502`,{
        mode: 'cors'
      }
    );
    const locationList = await response.json();
    return locationList;
  };

  return { weather, searchLocation };
};

UIController().init();
