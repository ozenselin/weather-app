// services/weatherService/index.js
import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createAPI } from "./api.js";

export const createWeatherService = () => {
    let isInitialized = false;
    let state = null;
    let events = null;
    let api = null;

    const initialize = () => {
        if (isInitialized) return;

        state = createState();
        events = createEvents(state);
        api = createAPI();

        state.initialize();
        events.initialize();
        api.initialize();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        if (state?.destroy) state.destroy();
        if (events?.destroy) events.destroy();
        if (api?.destroy) api.destroy();

        state = null;
        events = null;
        api = null;
        isInitialized = false;
    };

    // Public API methods
    const getCurrentForecast = () => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.getCurrentForecast();
    };

    const fetchWeatherForLocation = async (location) => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return api.fetchWeatherForecast(location);
    };

    const getFavouriteForecasts = () => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.getFavouriteForecasts();
    };

    const addToFavourites = (forecast) => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.addNewFavouriteForecast(forecast);
    };

    const getCurrentDayIndex = () => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.getCurrentDayIndex();
    };

    const getCurrentHourIndex = () => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.getCurrentHourIndex();
    };

    const setCurrentDay = (dayIndex) => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.setCurrentDayIndex(dayIndex);
    };

    const setCurrentHour = (hourIndex) => {
        if (!isInitialized) throw new Error("Must call initialize() first!");
        return state.setCurrentHourIndex(hourIndex);
    };

    return {
        initialize,
        destroy,
        getCurrentForecast,
        fetchWeatherForLocation,
        getFavouriteForecasts,
        addToFavourites,
        getCurrentDayIndex,
        getCurrentHourIndex,
        setCurrentDay,
        setCurrentHour,
        get isInitialized() {
            return isInitialized;
        }
    };
};

export const weatherService = createWeatherService();
