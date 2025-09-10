import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createAPI = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let isInitialized = false;

    const buildUrl = (query) => {
        const { baseUrl, apiKey } = config.api?.weatherApi;
        return `${baseUrl}/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
    };

    const fetchLocationSuggestions = async (query) => {
        const url = buildUrl(query);
        try {
            eventBus.emit("location:api-fetch-started", query);
            
            const response = await fetch(url, { mode: "cors" });
            if (!response.ok) {
                throw new Error("Response status: " + response.status);
            }

            const suggestions = await response.json();
            
            eventBus.emit("location:api-fetch-completed", { 
                query, 
                suggestions 
            });
            
            return suggestions;
        } catch (error) {
            console.error("Location API Error:", error);
            eventBus.emit("location:api-fetch-failed", { 
                query, 
                error: error.message 
            });
            throw new Error("Location fetch failed: " + error.message);
        }
    };

    const fetchLocationSuggestionsByCoords = (latitude, longitude) => {
        const query = latitude + "," + longitude;
        return fetchLocationSuggestions(query);
    };

    const fetchLocationSuggestionsByName = (name) => {
        return fetchLocationSuggestions(name);
    };

    const fetchLocationSuggestionsByQuery = (query) => {
        return fetchLocationSuggestions(query);
    };

    const initialize = () => {
        if (isInitialized) return;
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        fetchLocationSuggestions,
        fetchLocationSuggestionsByCoords,
        fetchLocationSuggestionsByName,
        fetchLocationSuggestionsByQuery,
        get isInitialized() {
            return isInitialized;
        }
    };
};