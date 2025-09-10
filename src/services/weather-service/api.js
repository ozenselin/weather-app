import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createAPI = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let isInitialized = false;

    const buildUrl = (coords, endpoint) => {
        const { baseUrl, apiKey, defaultParams } = config.api?.visualCrossing;
        return `${baseUrl}/${encodeURI(coords)}/${endpoint}?${defaultParams}&key=${apiKey}`;
    };

    const fetchWeatherForecast = async (location, days = 7) => {
        const coords = `${location.lat},${location.lon}`;
        const endpoint = days === -1 ? 'last24hours' : 'next7days';
        const url = buildUrl(coords, endpoint);
        
        try {
            eventBus.emit("weather:api-fetch-started", { location, days });
            
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) {
                throw new Error("Response status: " + response.status);
            }
            
            const data = await response.json();
            data.location = location;
            
            eventBus.emit("weather:api-fetch-completed", { location, data });
            
            return data;
        } catch (error) {
            console.error("Weather API Error:", error);
            eventBus.emit("weather:api-fetch-failed", { location, error: error.message });
            throw new Error("Failed to fetch weather forecast: " + error.message);
        }
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
        fetchWeatherForecast,
        get isInitialized() {
            return isInitialized;
        }
    };
};

// Create singleton instance
export const weatherAPI = createAPI();