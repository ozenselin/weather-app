import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createDOM = (state) => {
    if (!config || !state || !eventBus) {
        throw new Error("config, state and event bus are required");
    }

    const RECENTS_MAX_ITEMS_SHOWN = 3;
    const SUGGESTIONS_MAX_ITEMS_SHOWN = 5;

    let elements = null;
    let isInitialized = false;
    let highlightedIndex = -1;

    const cacheElements = () => {
        elements = {
            dropdown: document.querySelector(".header__controls__search-form__results-wrapper"),
            suggestionsList: document.querySelector(".results__suggestions__list"),
            recentsList: document.querySelector(".results__recents__list"),
            form: document.querySelector("#search-form"),
            input: document.querySelector("#search-input"),
            currentLocation: document.querySelector(".results__current-location"),
            loadingIndicator: document.querySelector(".results__loading"),
            suggestionsSection: document.querySelector(".results__suggestions"),
            recentsSection: document.querySelector(".results__recents"),
            clearButton: document.querySelector(".header__controls__search-form__btn--clear")
        };
    };

    const getElements = () => {
        if (!elements) {
            cacheElements();
        }
        return elements;
    };

    const openDropdown = () => {
        const dropdown = getElements().dropdown;
        if (dropdown) {
            dropdown.classList.add("is-open");
            eventBus.emit("search:dropdown-opened");
        }
    };

    const closeDropdown = () => {
        const dropdown = getElements().dropdown;
        if (dropdown) {
            dropdown.classList.remove("is-open");
            highlightedIndex = -1;
            eventBus.emit("search:dropdown-closed");
        }
    };

    const isDropdownHovered = () => {
        const dropdown = getElements().dropdown;
        return dropdown && dropdown.matches(':hover');
    };

    const isClickInside = (target) => {
        const dropdown = getElements().dropdown;
        const input = getElements().input;
        return (dropdown && dropdown.contains(target)) || 
               (input && input.contains(target));
    };

    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="match">$1</span>');
    };

    const displaySuggestions = (suggestions = []) => {
        const suggestionsList = getElements().suggestionsList;
        if (!suggestionsList) return;

        suggestionsList.innerHTML = "";

        const limitedSuggestions = suggestions.slice(0, SUGGESTIONS_MAX_ITEMS_SHOWN);
        const searchQuery = state.getSearchQuery();

        limitedSuggestions.forEach(suggestion => {
            const item = createSuggestionsListItem(suggestion, searchQuery);
            suggestionsList.appendChild(item);
        });

        updateHighlight();
    };

    const displayRecents = (recents = []) => {
        const recentsList = getElements().recentsList;
        if (!recentsList) return;

        recentsList.innerHTML = "";

        const limitedRecents = recents.slice(0, RECENTS_MAX_ITEMS_SHOWN);
        const searchQuery = state.getSearchQuery();

        limitedRecents.forEach(recent => {
            const item = createRecentsListItem(recent, searchQuery);
            recentsList.appendChild(item);
        });

        updateHighlight();
    };

    const createListItem = (item, listName, searchTerm = "") => {
        const li = document.createElement("li");
        const suggestionsIcon = `<svg class="icon suggestions__list__item__icon--location" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>`;
        const recentsIcon = `<svg class="icon results__recents__list__item__icon--location" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/></svg>`;

        li.classList.add(`${listName}__list__item`, "results__item");
        li.setAttribute("data-id", item.id);

        const highlightedName = highlightText(item.fullName, searchTerm);

        li.innerHTML = `
            <div class="${listName}__list__item__icon-wrapper">
                ${listName === "suggestions" ? suggestionsIcon : recentsIcon}
            </div>
            <p class="${listName}__list__item__details">
                <span class="${listName}__list__item__full-name">${highlightedName}</span>
            </p>
        `;

        return li;
    };

    const createSuggestionsListItem = (suggestion, searchTerm) => {
        return createListItem(suggestion, "suggestions", searchTerm);
    };

    const createRecentsListItem = (recent, searchTerm) => {
        return createListItem(recent, "results__recents", searchTerm);
    };

    const updateLoadingState = (isLoading) => {
        const loadingIndicator = getElements().loadingIndicator;
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    };

    const updateSearchInput = (query) => {
        const input = getElements().input;
        if (input && input.value !== query) {
            input.value = query;
        }
    };

    const blurInput = () => {
        const input = getElements().input;
        if (input) {
            input.blur();
        }
    };

    const navigateItems = (direction) => {
        const visibleItems = getVisibleItems();
        if (visibleItems.length === 0) return;

        if (direction === 'down') {
            highlightedIndex = highlightedIndex < visibleItems.length - 1 ? 
                highlightedIndex + 1 : 0;
        } else {
            highlightedIndex = highlightedIndex > 0 ? 
                highlightedIndex - 1 : visibleItems.length - 1;
        }

        updateHighlight();
    };

    const getVisibleItems = () => {
        const dropdown = getElements().dropdown;
        if (!dropdown) return [];
        return Array.from(dropdown.querySelectorAll('.results__item'));
    };

    const updateHighlight = () => {
        const visibleItems = getVisibleItems();
        
        // Remove previous highlight
        visibleItems.forEach(item => item.classList.remove('highlighted'));
        
        // Add new highlight
        if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
            visibleItems[highlightedIndex].classList.add('highlighted');
        }
    };

    const getHighlightedItem = () => {
        const visibleItems = getVisibleItems();
        if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
            return visibleItems[highlightedIndex];
        }
        return null;
    };

    const initialize = () => {
        if (isInitialized) return;
        cacheElements();
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        elements = null;
        highlightedIndex = -1;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        getElements,
        
        // Dropdown management
        openDropdown,
        closeDropdown,
        isDropdownHovered,
        isClickInside,

        
        // Display methods
        displaySuggestions,
        displayRecents,
        updateLoadingState,
        updateSearchInput,

        
        // Keyboard navigation
        blurInput,
        navigateItems,
        getHighlightedItem,
        
        get isInitialized() {
            return isInitialized;
        }
    };
};