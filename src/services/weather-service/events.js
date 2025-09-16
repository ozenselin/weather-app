import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config, favourites } from "../../shared/config.js";
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
            // Import API dynamically to avoid circular dependency
            const { weatherAPI } = await import("./api.js");
            const newForecastData = await weatherAPI.fetchWeatherForecast(newLocation);

            if (!newForecastData) return;

            state.setCurrentForecast(newForecastData);
            state.setCurrentDayIndex(0);
            const hourIndex = getDateFromUTCOffset(newForecastData.tzoffset).getHours();
            state.setCurrentHourIndex(hourIndex);
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

    const emitWeatherStateChange = () => {
        eventBus.emit("weather:state-changed", {
            forecast: state.getCurrentForecast(),
            hourIndex: state.getCurrentHourIndex(),
            dayIndex: state.getCurrentDayIndex(),
        });
    }

    const handleForecastRequest = (respond) => {
        respond(state.getCurrentState());
    }
    
    const handleFavouriteForecastsRequest = () => {
        eventBus.emit("weather:favourite-forecasts-delivered",  state.getFavouriteForecasts());
    }

    const updateCacheWithFresh = (currentForecasts, refreshedForecasts) => {
        const updatedForecasts = [...currentForecasts];
        
        refreshedForecasts.forEach(freshForecast => {
            const existingIndex = updatedForecasts.findIndex(cached => 
                cached.location.id == freshForecast.location.id
            );
            
            if (existingIndex >= 0) {
                updatedForecasts[existingIndex] = freshForecast;
            } else {
                updatedForecasts.push(freshForecast);
            }
        });
        
        return updatedForecasts;
    };

    const backgroundRefresh = async (locations) => {
        console.log("Background refresh starting");
        const { weatherAPI } = await import("./api.js");
        const refreshedForecasts = await fetchWithDelay(locations, weatherAPI);
        
        // Quietly update cache
        const currentForecasts = state.getFavouriteForecasts();
        const updatedForecasts = updateCacheWithFresh(currentForecasts, refreshedForecasts);
        state.setFavouriteForecasts(updatedForecasts);
        console.log("Background refresh completed, updated forecasts:", updatedForecasts);
    };
    
    const fetchWithDelay = async (locations, weatherAPI) => {
        const forecasts = [];
        
        for (const location of locations) {
            try {
                const newForecastData = await weatherAPI.fetchWeatherForecast(location);
                newForecastData.location = location;
                forecasts.push(newForecastData);
                
                // if not last element of array 
                if (locations.indexOf(location) < locations.length - 1) {
                    //wait for for rate limit
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
                
            } catch(error) {
                console.error('Weather fetch error:', error);
                eventBus.emit("weather:fetch-error", { location, error });
            }
        }
        
        return forecasts;
    };

    const separateCachedAndNew = (favoriteLocations, favouriteForecasts) => {
        const cached = [];
        const needsFetch = [];
        
        favoriteLocations.forEach(location => {
            const existingForecast = favouriteForecasts.find(forecast => {
                forecast.location.id == location.id
            });
            
            if(existingForecast) {
                cached.push(existingForecast);
            } else {
                needsFetch.push(location);
            }
        });
        
        return { cached, needsFetch };
    };

    const handleFavouriteLocationsChange = async (newFavouriteLocations) => {
        if(!newFavouriteLocations) return;

        const currentForecasts = state.getFavouriteForecasts(); // get cached forecasts
        const { weatherAPI } = await import("./api.js");
        
        // classification
        const { cached, needsFetch } = separateCachedAndNew(newFavouriteLocations, currentForecasts);
        
        //initially all forecasts only contain cached forecasts
        let allForecasts = [...cached];
        
        // if fetching is needed
        if (needsFetch.length > 0) {
            //fetch with delay
            const freshForecasts = await fetchWithDelay(needsFetch, weatherAPI);
            //update allForecasts
            allForecasts = [...allForecasts, ...freshForecasts];
        }
        
        //update favourite forecasts
        state.setFavouriteForecasts(allForecasts);
        
        // refresh every 15 minutes
        setTimeout(() => backgroundRefresh(newFavouriteLocations), 15 * 60 * 1000);
    }



    const setupEventListeners = () => {
        // Listen for location changes
        eventBus.on("location:current-changed", handleCurrentLocationChange);
        
        // Listen for weather requests
        eventBus.on("weather:forecast-change-requested", handleCurrentForecastChangeRequest);
        eventBus.on("weather:day-change-requested", handleDayChangeRequest);
        eventBus.on("weather:hour-change-requested", handleHourChangeRequest);
        eventBus.on("weather:add-favourite-requested", handleAddToFavouritesRequest);
        eventBus.on("weather:forecast-requested", handleForecastRequest);
        eventBus.on("weather:favourite-forecasts-requested", handleFavouriteForecastsRequest);

        //location changes
        eventBus.on("location:favourites-changed", handleFavouriteLocationsChange);


        //listen for weather changes
    };

    const removeEventListeners = () => {

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