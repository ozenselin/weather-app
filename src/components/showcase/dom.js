import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";
import { getBackgroundPath, getIconPath } from "../../shared/utils/assets.js";
import { getFormattedDayLong, getFormattedDayShort, getFormattedHourByIndex } from "../../shared/utils/date.js";
import { getWeatherSubtitle } from "../../shared/utils/weather.js";
import { createFullName } from "../../shared/utils/location.js";

export const createDOM = () => {
    if (!config || !eventBus) {
        throw new Error("config, state and event bus are required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            //showcase 
            condition: document.querySelector(".weather-summary__condition"),
            conditionTitle: document.querySelector(".weather-summary__condition__title"),
            conditionSubtitle: document.querySelector(".weather-summary__condition__subtitle"),
            description: document.querySelector(".weather-summary__description"),
            locationIcon: document.querySelector(".current-weather__icon"),
            locationName: document.querySelector(".weather-summary__location__name"),
            temperature: document.querySelector(".current-weather__temperature"),
            day: document.querySelector(".current-weather__datetime__day"),
            time: document.querySelector(".current-weather__datetime__time"),
            precip: document.querySelector(".current-weather__precip__value"),
            dew: document.querySelector(".current-weather__dew__value"),
            uv: document.querySelector(".current-weather__uv__value"),
            windValue: document.querySelector(".current-weather__wind__value"),
            windUnit: document.querySelector(".current-weather__wind__unit"),
        };
    }

    const displayTheShowcase = (state) => {
        if(!state) return;
        const {forecast, hourIndex, dayIndex} = state;
        console.log("DISPLAYIN THE SHOWCASE IN SHOWCASE COMPONENT AND THE CURRENT STATE IS:", state);

        const daysData = forecast.days;

        let currentData; //data to display
        let dayName; //day name can be formated short (3 characters) depending on hour state

        //if hour is set to null
        if(hourIndex == null) {
            //data to display is a day data
            currentData = daysData.at(dayIndex); //get day data

            //if no hour, get long day name
            dayName = getFormattedDayLong(new Date(currentData.datetime).getDay()); //format: Thursday, Wednesday

            elements.time.textContent = ""; //display no hour
            
        } else { //if hour is valid
            //get hours data
            const hoursData = daysData.at(dayIndex).hours; 

            //data to display is an hour data
            currentData = hoursData.at(hourIndex);

            //get 3 characters day name
            dayName = getFormattedDayShort(new Date(daysData.at(dayIndex).datetime).getDay());//format: Thu, Wed

            elements.time.textContent = getFormattedHourByIndex(hourIndex);
        }

        console.log("CURRENT DATA TO DISPLAY AFTER IF ELSE STATEMENTS", currentData);

        //display current data nad day name
        const conditions = currentData.conditions.split(", ");
        const subtitle = getWeatherSubtitle(conditions);
        console.log("conditions", conditions);
        console.log("subtitle", subtitle);
        const title = conditions.at(0);

        //title, subtitle & description
        elements.conditionTitle.textContent = title;
        elements.conditionSubtitle.textContent = subtitle;
        elements.description.textContent = daysData.at(dayIndex).description; //get todays data

        //temperature
        eventBus.emit("unit:display-temperature-requested", {value: currentData.temp, fromUnit: "fahrenheit", element: elements.temperature});

        //location
        const location = forecast.location;
        elements.locationName.textContent = createFullName(location);
        elements.locationIcon.src = getIconPath(currentData.icon);

        //time
        elements.day.textContent = dayName;

        //details
        elements.precip.textContent = currentData.precipprob;
        elements.dew.textContent = currentData.humidity;
        elements.uv.textContent = currentData.uvindex;

        eventBus.emit("unit:display-speed-requested", {value: currentData.windspeed, element: elements.windValue})
        eventBus.emit("unit:display-speed-unit-requested", {value: currentData.windspeed, element: elements.windUnit})
        // elements.windValue.textContent = unit == "F" ? currentData.windspeed : mphToKmh(currentData.windspeed);
        // elements.windUnit.textContent = unit == "F" ? "mph" : "km/h";

        //backgroud
        document.body.style.backgroundImage =`url(${getBackgroundPath(currentData.icon)})`;
    }

    const getElements = () => {
        if(!elements) {
            cacheElements();
        }
        return elements;
    }

    const initialize = () => {
        if(isInitialized) return;
        cacheElements();
        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first!");
        elements = null;
        isInitialized = false;
    }
    
    return {
        initialize,
        destroy,
        getElements,
        displayTheShowcase,
        get isInitialized(){
            return isInitialized;
        }
    }
}