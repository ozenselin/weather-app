import { config } from "../../shared/config.js";
import { eventBus } from "../../shared/eventBus.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    const MAX_FAVOURITES_LENGTH = 10;
    const STORAGE_KEY = 'weather-app-favourites';

    let isInitialized = false;

    let currentForecast = null; //current forecast
    let favouriteForecasts = [];

    let currentDayIndex = 0;
    let previousDayIndex = 0;

    let currentHourIndex = null;

    const getCurrentForecast = () => {
        if (!currentForecast) return null;
        return { ...currentForecast };
    };

    const setCurrentForecast = (newForecast) => {
        if (!newForecast) return;
        currentForecast = newForecast;
        eventBus.emit("weather:forecast-changed", getCurrentState());
    };

    const getCurrentState = () => {
        return {
            forecast: getCurrentForecast(),
            dayIndex: getCurrentDayIndex(),
            hourIndex: getCurrentHourIndex(),
        }
    }

    const getFavouriteForecasts = () => {
        if (!favouriteForecasts) return [];
        return [...favouriteForecasts];
    };

    const addNewFavouriteForecast = (newFavourite) => {
        if (!newFavourite) return;
        
        let found = false;
        for (const favourite of favouriteForecasts) {
            if (favourite.location.id == newFavourite.location.id) {
                found = true;
                break;
            }
        }

        if (found) return;

        //if not found push it to the list
        favouriteForecasts.push(newFavourite);

        //if threshold is passed 
        if (favouriteForecasts.length > MAX_FAVOURITES_LENGTH) {
            //shift to fit in the maximum length
            favouriteForecasts.shift();
        }

        //save the new list
        saveFavourites();

        //emit new list
        eventBus.emit("weather:favourites-changed", getFavouriteForecasts());
    };

    const setFavouriteForecasts = (newFavourites) => {
        if (!newFavourites) return;
        
        let sanitizedList = [];
        let ids = [];
        
        for (const favorite of newFavourites) {
            const id = favorite.location.id;
            const index = ids.indexOf(id);
            if (index < 0) {
                sanitizedList.push(favorite);
                ids.push(id);
            }
        }

        favouriteForecasts = sanitizedList;
        
        //if threshold is passed 
        while (favouriteForecasts.length > MAX_FAVOURITES_LENGTH) {
            //shift to fit in the maximum length
            favouriteForecasts.shift();
        }

        //save the new list
        saveFavourites();

        //emit new list
        eventBus.emit("weather:favourites-changed", getFavouriteForecasts());
    };

    const getUnit = () => {
        return unit;
    };

    const getCurrentHourIndex = () => {
        if (currentHourIndex === null || currentHourIndex === undefined) {
            return null;
        }
        return currentHourIndex;
    };

    const setCurrentHourIndex = (newHourIndex) => {
        if (newHourIndex || newHourIndex === 0) {
            currentHourIndex = newHourIndex;
        } else {
            currentHourIndex = null; //allow current hour index to be null
        }

        eventBus.emit("weather:hour-changed", getCurrentState());
    };

    const getCurrentDayIndex = () => {
        return currentDayIndex;
    };

    const setCurrentDayIndex = (newDayIndex) => {
        if (newDayIndex === null || newDayIndex === undefined) {
            if (newDayIndex !== 0) return;
        }

        previousDayIndex = currentDayIndex;
        currentDayIndex = newDayIndex;
        eventBus.emit("weather:day-changed", getCurrentState());
    };

    const getPreviousDayIndex = () => {
        return previousDayIndex;
    };

    const saveFavourites = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favouriteForecasts));
        } catch (error) {
            console.error("Error saving favourite forecasts", error);
        }
    };

    const loadFavourites = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favourite forecasts:', error);
            return [];
        }
    };

    const initialize = () => {
        if (isInitialized) return;
        
        // Load favourite forecasts from storage
        favouriteForecasts = loadFavourites();
        
        // Emit initial state
        if (favouriteForecasts.length > 0) {
            eventBus.emit("weather:favourites-changed", getFavouriteForecasts());
        }
        
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        currentForecast = null;
        favouriteForecasts = [];
        currentDayIndex = 0;
        previousDayIndex = 0;
        currentHourIndex = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        getCurrentForecast, 
        setCurrentForecast,
        getPreviousDayIndex,
        getCurrentHourIndex, 
        setCurrentHourIndex,
        getCurrentDayIndex, 
        setCurrentDayIndex,
        addNewFavouriteForecast, 
        getFavouriteForecasts, 
        setFavouriteForecasts,
        getCurrentState,
        get isInitialized() {
            return isInitialized;
        }
    };
};