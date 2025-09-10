import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    const MAX_RECENTS_LENGTH = 100;
    const MAX_FAVOURITES_LENGTH = 100;
    const STORAGE_KEY = 'weather-app-locations';

    let isInitialized = false;
    let current = null; //current location
    let recents = null; //previous locations
    let favourites = null; //favourite locations
    let userLocation = null; //user location

    const setCurrentLocation = (newLocation) => {
        if (!newLocation || (current && current.id == newLocation.id)) {
            return;
        }
        //store previous location
        const previous = current;

        current = newLocation;

        eventBus.emit("location:current-changed", getCurrentLocation());

        if (previous) {
            let found = false;
            for (const recent of recents) {
                if (recent.id == previous.id) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                //if not found push it to the list
                recents.push(previous);

                //if threshold is passed 
                if (recents.length > MAX_RECENTS_LENGTH) {
                    //shift to fit in the maximum length
                    recents.shift();
                }

                //save the new list
                saveLocations();

                //emit new list
                eventBus.emit("location:recents-changed", getRecents());
            }
        }
    };

    const getCurrentLocation = () => {
        if (!current) return;
        return { ...current };
    };

    const getRecents = () => {
        if (!recents) return [];
        return [...recents];
    };

    const getFavourites = () => {
        if (!favourites) return [];
        return [...favourites];
    };

    const getUserLocation = () => {
        if (!userLocation) return null;
        return { ...userLocation };
    };

    const setRecents = (newRecents) => {
        recents = newRecents || [];
        saveLocations();
        eventBus.emit("location:recents-changed", getRecents());
    };

    const setFavourites = (newFavourites) => {
        if (!newFavourites) return;
        let ids = [];
        let sanitizedList = [];
        for (let favourite of newFavourites) {
            if (!ids.includes(favourite.id)) {
                sanitizedList.push(favourite);
                ids.push(favourite.id);
            }
        }

        favourites = sanitizedList;

        saveLocations();
        eventBus.emit("location:favourites-changed", getFavourites());
    };

    const addNewFavourite = (newFavourite) => {
        if (!newFavourite) return;

        let found = false;
        for (const favourite of favourites) {
            if (favourite.id == newFavourite.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            //if not found push it to the list
            favourites.push(newFavourite);

            //if threshold is passed 
            if (favourites.length > MAX_FAVOURITES_LENGTH) {
                //shift to fit in the maximum length
                favourites.shift();
            }

            //save the new list
            saveLocations();

            //emit new list
            eventBus.emit("location:favourites-changed", getFavourites());
        }
    };

    const setUserLocation = (newUserLocation) => {
        if (!newUserLocation || (userLocation && userLocation.id == newUserLocation.id)) {
            return;
        }

        userLocation = newUserLocation;
        saveLocations();
        eventBus.emit("location:user-changed", getUserLocation());
    };

    const saveLocations = () => {
        try {
            const locations = {
                recents: recents || [],
                favourites: favourites || [],
                userLocation,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
        } catch (error) {
            console.error("Error saving locations", error);
        }
    };

    const clearRecents = () => {
        recents = [];
        saveLocations();
        eventBus.emit("location:recents-changed", getRecents());
    };

    const clearFavourites = () => {
        favourites = [];
        saveLocations();
        eventBus.emit("location:favourites-changed", getFavourites());
    };

    const getRecentLocationById = (itemId) => {
        const item = recents.find(recent => recent.id === itemId);
        return item ? { ...item } : null;
    };

    const getFavouriteLocationById = (itemId) => {
        const item = favourites.find(favourite => favourite.id === itemId);
        return item ? { ...item } : null;
    };

    const addFavouriteLocation = (newLocation) => {
        if (!newLocation) return;
        
        // Check if already exists
        const exists = favourites.some(fav => fav.id === newLocation.id);
        if (exists) return;

        favourites.push(newLocation);

        if (favourites.length > MAX_FAVOURITES_LENGTH) {
            favourites.shift();
        }

        saveLocations();
        eventBus.emit("location:favourites-changed", getFavourites());
    };

    const removeFavouriteLocation = (itemId) => {
        favourites = favourites.filter(favourite => favourite.id !== itemId);
        saveLocations();
        eventBus.emit("location:favourites-changed", getFavourites());
    };

    const loadLocations = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading locations:', error);
            return null;
        }
    };

    const initialize = () => {
        if (isInitialized) return;
        
        const locations = loadLocations();

        if (!locations) {
            recents = [];
            favourites = [];
            userLocation = config.location || null;
            current = userLocation;
        } else {
            recents = locations.recents || [];
            favourites = locations.favourites || [];
            userLocation = locations.userLocation || config.location || null;
            current = userLocation || config.location || null;
        }

        //send initial locations
        if (current) {
            eventBus.emit("location:current-changed", getCurrentLocation());
        }
        eventBus.emit("location:favourites-changed", getFavourites());
        eventBus.emit("location:recents-changed", getRecents());
        if (userLocation) {
            eventBus.emit("location:user-changed", getUserLocation());
        }

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        
        recents = null;
        favourites = null;
        current = null;
        userLocation = null;
        isInitialized = false;
    };

    return {
        //core functionality
        initialize, 
        destroy,

        //current location
        getCurrentLocation, 
        setCurrentLocation,

        //recents
        getRecents,
        setRecents,
        clearRecents,
        getRecentLocationById,

        //favourites
        addNewFavourite,
        getFavourites,
        setFavourites,
        clearFavourites,
        removeFavouriteLocation,
        addFavouriteLocation,
        getFavouriteLocationById,

        //user
        getUserLocation,
        setUserLocation,

        get isInitialized() {
            return isInitialized;
        }
    };
};