import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";
import { getDateFromUTCOffset } from "../../shared/utils/date.js";

export const createEvents = (state) => {
    if (!state || !config || !eventBus) {
        throw new Error("state, config and event bus are required");
    }

    let eventManager = null;
    let isInitialized = false;
    let api = null;

    const handleCurrentLocationChange = async (newLocation) => {
        if (!newLocation) return;

        try {
            eventBus.emit("weather:fetch-started", newLocation);
            // Import API dynamically to avoid circular dependency
            const { weatherAPI } = await import("./api.js");
            const newForecastData = await weatherAPI.fetchWeatherForecast(newLocation);

            if (!newForecastData) return;

            state.setCurrentForecast(newForecastData);
            state.setCurrentDayIndex(0);
            const hourIndex = getDateFromUTCOffset(newForecastData.tzoffset).getHours();
            state.setCurrentHourIndex(hourIndex);
            eventBus.emit("weather:fetch-completed", newForecastData);
        } catch (error) {
            console.error('Weather service fetch error:', error);
            eventBus.emit("weather:fetch-error", { location: newLocation, error });
        }
    };

    const handleCurrentForecastChangeRequest = (newForecast) => {
        if (!newForecast) return;
        state.setCurrentForecast(newForecast);
    };

    const handleDayChangeRequest = (dayIndex) => {
        state.setCurrentDayIndex(dayIndex);
    };

    const handleHourChangeRequest = (hourIndex) => {
        state.setCurrentHourIndex(hourIndex);
    };

    const handleUnitChangeRequest = (unit) => {
        state.setUnit(unit);
    };

    const handleAddToFavouritesRequest = (forecast) => {
        state.addNewFavouriteForecast(forecast);
    };

    const setupEventListeners = () => {
        // Listen for location changes
        eventBus.on("location:current-changed", handleCurrentLocationChange);
        
        // Listen for weather requests
        eventBus.on("weather:forecast-change-requested", handleCurrentForecastChangeRequest);
        eventBus.on("weather:day-change-requested", handleDayChangeRequest);
        eventBus.on("weather:hour-change-requested", handleHourChangeRequest);
        eventBus.on("weather:unit-change-requested", handleUnitChangeRequest);
        eventBus.on("weather:add-favourite-requested", handleAddToFavouritesRequest);
    };

    const removeEventListeners = () => {
        eventBus.off("location:current-changed", handleCurrentLocationChange);
        eventBus.off("weather:forecast-change-requested", handleCurrentForecastChangeRequest);
        eventBus.off("weather:day-change-requested", handleDayChangeRequest);
        eventBus.off("weather:hour-change-requested", handleHourChangeRequest);
        eventBus.off("weather:unit-change-requested", handleUnitChangeRequest);
        eventBus.off("weather:add-favourite-requested", handleAddToFavouritesRequest);
    };

    const initialize = () => {
        if (isInitialized) return;

        eventManager = createEventManager();
        setupEventListeners();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        removeEventListeners();
        if (eventManager?.destroy) {
            eventManager.destroy();
        }
        eventManager = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        }
    };
};