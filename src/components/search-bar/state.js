import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";
import { createFullName } from "../../shared/utils/location.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let isInitialized = false;
    let suggestions = null; // API search suggestions
    let recents = null; // API recents
    let isLoading = false;
    let searchQuery = "";
    let lastSearchQuery = "";

    const getSuggestions = () => {
        if (!suggestions) return [];
        return [...suggestions];
    };

    const setSuggestions = (newSuggestions) => {
        console.log("LOGGING SUGGESTIONS IN SERACH BAR STATE", suggestions);
        if (!newSuggestions) {
            suggestions = [];
            return;
        }

        suggestions = newSuggestions.map(suggestion => ({
            ...suggestion,
            fullName: createFullName(suggestion)
        }));
        
        eventBus.emit("search:suggestions-changed", getSuggestions());
    };
    
    
    const clearSuggestions = () => {
        suggestions = [];
        eventBus.emit("search:suggestions-changed", getRecents());
    };
    
    const getSuggestionById = (itemId) => {
        if (!suggestions) return null;
        const item = suggestions.find(suggestion => suggestion.id === itemId);
        return item ? { ...item } : null;
    };
    
    const getRecents = () => {
        if (!recents) return [];
        return [...recents];
    };

    const setRecents = (newRecents) => {
        console.log("LOGGING RECENTS IN SEARCH BAR STATE", recents);
        if (!newRecents) {
            recents = [];
            return;
        }

        recents = newRecents.map(recent => ({
            ...recent,
            fullName: createFullName(recent)
        }));

        eventBus.emit("search:recents-changed", getRecents());
    };

    const clearRecents = () => {
        recents = [];
        eventBus.emit("search:recents-changed", getRecents());
    };

    const getRecentById = (itemId) => {
        if (!recents) return null;
        const item = recents.find(recent => recent.id === itemId);
        return item ? { ...item } : null;
    };

    const getLocationById = (itemId) => {
        let location = getSuggestionById(itemId);
        console.log("getSuggestionById(itemId);", location);
        if(!location) {
            location = getRecentById(itemId);
        console.log(" getRecentById(itemId);", location);

        }
        return location;
    }

    const setLoading = (loading) => {
        if (isLoading === loading) return;
        isLoading = loading;
        eventBus.emit("search:loading-changed", isLoading);
    };

    const getLoading = () => {
        return isLoading;
    };

    const setSearchQuery = (query) => {
        searchQuery = query || "";
        eventBus.emit("search:query-changed", searchQuery);
    };

    const getSearchQuery = () => {
        return searchQuery;
    };

    const setLastSearchQuery = (query) => {
        lastSearchQuery = query || "";
    };

    const getLastSearchQuery = () => {
        return lastSearchQuery;
    };

    const initialize = () => {
        if (isInitialized) return;

        suggestions = [];
        recents = [];
        isLoading = false;
        searchQuery = "";
        lastSearchQuery = "";

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        suggestions = null;
        recents = null;
        isLoading = false;
        searchQuery = "";
        lastSearchQuery = "";
        isInitialized = false;
    };

    return {
        // core functionality
        initialize,
        destroy,

        // suggestions
        getSuggestions,
        setSuggestions,
        clearSuggestions,
        getSuggestionById,

        //recent & suggestion
        getLocationById,

        //recents
        getRecents,
        setRecents,
        clearRecents,
        getRecentById,

        // loading state
        setLoading,
        getLoading,

        // search query
        setSearchQuery,
        getSearchQuery,
        setLastSearchQuery,
        getLastSearchQuery,

        get isInitialized() {
            return isInitialized;
        }
    };
};