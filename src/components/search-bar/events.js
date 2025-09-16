import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (state, dom) => {
    if (!state || !dom || !eventBus || !config) {
        throw new Error("state, dom, event bus, and config are required");
    }

    let eventManager = null;
    let isInitialized = false;
    let elements = null;

    // Event handlers for search functionality
    const handleSuggestionsChanged = (suggestions) => {
        dom.displaySuggestions(suggestions);
    };

    const handleRecentsChanged = (recents) => {
        state.setRecents(recents);
        dom.displayRecents(recents);
    };

    const handleLoadingChanged = (isLoading) => {
        dom.updateLoadingState(isLoading);
    };

    // Event handlers for API responses
    const handleSuggestionsStarted = (query) => {
        state.setLoading(true);
    };

    const handleSuggestionsDelivered = (data) => {
        const { query, suggestions } = data;

        state.setSuggestions(suggestions);
        state.setLoading(false);
    };

    const handleSuggestionsFailed = (data) => {
        const { query, error } = data;
        state.clearSuggestions();
        state.setLoading(false);
        console.error("Search failed:", error);
        eventBus.emit("search:error", error);
    };

    // DOM event handlers
    const handleInputChange = (event) => {
        const query = event.target.value.trim();
        eventBus.emit("location:suggestions-requested", query);
        dom.displayRecents(state.getRecents());
    };

    const handleInputFocus = () => {
        dom.openDropdown();
        eventBus.emit("dropdown:opened");
    };

    // const handleFormSubmit = (event) => {
    //     event.preventDefault();
        
    //     const query = state.getSearchQuery().trim();
    //     if (query.length < 2) return;

    //     // If we have suggestions, select the first one
    //     const suggestions = state.getSuggestions();
    //     if (suggestions && suggestions.length > 0) {
    //         selectLocation(suggestions[0]);
    //     }
    // };

    // const handleItemClick = (event) => {
    //     const item = event.target.closest('[data-id]');
    //     if (!item) return;

    //     const itemId = item.getAttribute('data-id');
    //     const location = getLocationById(itemId);
        
    //     if (location) {
    //         selectLocation(location);
    //     }
    // };

    const getLocationById = (itemId) => {
        // First check suggestions
        let location = state.getSuggestionById(itemId);
        if (location) return location;

        // Then check location service for recents
        eventBus.emit("location:get-recent-by-id-requested", itemId);
        // This would need to be handled synchronously or with a callback
        // For now, we'll emit an event and expect the location service to handle selection
        return null;
    };

    // const selectLocation = (location) => {
    //     if (!location) return;

    //     // Clear search
    //     state.setSearchQuery("");
    //     state.clearSuggestions();
    //     dom.closeDropdown();

    //     // Request location change through location service
    //     eventBus.emit("location:change-requested", location);
    // };

    // Handle clicks outside dropdown
    const handleDocumentClick = (event) => {
        if (!dom.isClickInside(event.target)) {
            dom.closeDropdown();
        }
    };

    const handleClearButtonClick = () => {
        elements.input.value = ""; 
        dom.displaySuggestions(); //clear suggestions
    }

    const handleDropdownOpened = () => {
        eventManager.addEventListener(document, "click", handleClickWhileDropdownOpen);
    }

    const handleDropdownClosed = () => {
        eventManager.removeEventListener(document, "click", handleClickWhileDropdownOpen);
    }

    const handleClickWhileDropdownOpen = (event) => {
        const dropdown = dom.getElements().dropdown;
        const form = dom.getElements().form;
        const target = event.target;

        if (!form.contains(target)) {
            dom.closeDropdown();
            eventBus.emit("dropdown:closed");
            return;
        }
        if (dropdown.contains(target)) {
            handleDropdownClick(event);
        }
    }

    const handleDropdownClick = async (event) => {
        const target = event.target;

        const elements = dom.getElements();
        const currentLocation = elements.currentLocation;
        const suggestionsList = elements.suggestionsList;
        const recentsList = elements.recentsList;

        if(currentLocation.contains(target)) {
            // Request location through location service
            eventBus.emit("location:user-update-requested", (location) => {
                eventBus.emit("location:change-requested", location);
            });
        } else {
            const item = target.closest("[data-id]");
            if(!item) return;
            const id = parseInt(item.getAttribute("data-id"));

            if (suggestionsList.contains(target) || recentsList.contains(target)) {
                let location = state.getLocationById(id);
                eventBus.emit("location:change-requested", location);
            }
        } 
        // Clear search
        state.clearSuggestions();
        dom.closeDropdown();
    }

    const handleRecentsDelivery = (newRecents) => {
        state.setRecents(newRecents);
        dom.displayRecents(newRecents);
    }

    const setupEventListeners = () => {
        // Location service events
        // eventBus.on("location:current-changed", handleCurrentLocationChanged);
        eventBus.on("location:suggestions-started", handleSuggestionsStarted);
        eventBus.on("location:suggestions-failed", handleSuggestionsFailed);
        eventBus.on("location:suggestions-delivered", handleSuggestionsDelivered);
        eventBus.on("location:recents-changed", handleRecentsChanged);
        eventBus.on("location:recents-delivered", handleRecentsDelivery);
        
        // Search internal events
        eventBus.on("search:suggestions-changed", handleSuggestionsChanged);
        eventBus.on("search:loading-changed", handleLoadingChanged);
        eventBus.on("dropdown:opened", handleDropdownOpened);
        eventBus.on("dropdown:closed", handleDropdownClosed);

        // DOM events
        const elements = dom.getElements();
        if (elements.input) {
            elements.input.addEventListener('input', handleInputChange);
            elements.input.addEventListener('focus', handleInputFocus);
        }

        if (elements.searchForm) {
            elements.searchForm.addEventListener('submit', handleFormSubmit);
        }
        
        // if (elements.dropdown) {
        //     elements.dropdown.addEventListener('click', handleItemClick);
        // }

        if (elements.clearButton) {
            elements.clearButton.addEventListener('click', handleClearButtonClick);
        }
    };

    const removeEventListeners = () => {
        // Location service events

        // Search internal events
        eventBus.off("search:suggestions-changed", handleSuggestionsChanged);
        eventBus.off("search:loading-changed", handleLoadingChanged);
        eventBus.off("search:query-changed", handleQueryChanged);

        // DOM events
        const elements = dom.getElements();
        if (elements.input) {
            elements.input.removeEventListener('input', handleInputChange);
            elements.input.removeEventListener('focus', handleInputFocus);
        }

        if (elements.searchForm) {
            elements.searchForm.removeEventListener('submit', handleFormSubmit);
        }

        if (elements.dropdown) {
            elements.dropdown.removeEventListener('click', handleItemClick);
        }

        document.removeEventListener('click', handleDocumentClick);
    };

    const initialize = () => {
        if (isInitialized) return;

        elements = dom.getElements();
        eventManager = createEventManager();
        setupEventListeners();

        eventBus.emit("location:recents-requested");

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