import { favourites as config } from "../../shared/config.js";
import { eventBus } from "../../shared/eventBus.js";
export const createDOM = (state) => {
    if (!config) {
        throw new Error("config is required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            list: document.querySelector(`.${config.classes.list}`),
            nextButtons: document.querySelectorAll(`.${config.classes.nextButton}`),
            previousButtons: document.querySelectorAll(
                `.${config.classes.previousButton}`
            ),
            dotsContainer: document.querySelector(
                `.${config.classes.dotsContainer}`
            ),
            items: Array.from(
                document.querySelectorAll(`.${config.classes.item}`)
            ),
            dots: Array.from(document.querySelectorAll(`.${config.classes.dot}`)),
            addButton: document.querySelector(`.${config.classes.addButton}`),
            itemButtons: Array.from(document.querySelectorAll(`.${config.classes.itemButton}`)),
        };
    };

    const createDot = () => {
        const dot = document.createElement("button");
        dot.classList.add(config.classes.dot, config.classes.button);
        return dot;
    };

    function createItem({temp, tempmin, tempmax, conditions, location: {id, name}}) {
        const li = document.createElement("li");
        const condition = conditions?.split(", ")?.at(0);
        li.className = "favourites__list__item";
        li.setAttribute("data-id", id);
        li.innerHTML = `
        <button class="btn favourites__list__item__btn">
            <span class="favourites__list__item__city">${name}</span>
            <div class="favourites__list__item__temp favourites__list__item__temp--current">
                <span class="favourites__list__item__temp--current__value">${temp}</span>
                <span class="favourites__list__item__temp__unit">°</span>
            </div>
            <span class="favourites__list__item__condition">${condition}</span>
            <div class="favourites__list__item__ranges">
                <div class="favourites__list__item__temp favourites__list__item__temp--high">
                    <span class="favourites__list__item__temp--high__value">${tempmax}</span>°
                </div>
                <div class="favourites__list__item__temp favourites__list__item__temp--low">
                    <span class="favourites__list__item__temp--low__value">${tempmin}</span>°
                </div>
            </div>
        </button>
        `;

        eventBus.emit("unit:display-temperature-requested", {value: temp, fromUnit: "fahrenheit", element: li.querySelector(".favourites__list__item__temp--current__value")});
        eventBus.emit("unit:display-temperature-requested", {value: tempmin, fromUnit: "fahrenheit", element: li.querySelector(".favourites__list__item__temp--low__value")});
        eventBus.emit("unit:display-temperature-requested", {value: tempmax, fromUnit: "fahrenheit", element: li.querySelector(".favourites__list__item__temp--high__value")});

        return li;
    }

    const injectHTML = (favourites) => {
        const list = elements.list;
        const dotsContainer = elements.dotsContainer;

        // let favourites = state.getFavourites()?.length ? state.getFavourites() : config.items;
        favourites.forEach((favourite) => {
            const item = createItem(favourite);
            const dot = createDot();

            list.appendChild(item);
            dotsContainer.appendChild(dot);
        });
    }

    const displayFavourites = (favourites) => {
        const elements = getElements();
        const list = elements.list;
        const dotsContainer = elements.dotsContainer;
        list.innerHTML = "";
        dotsContainer.innerHTML = "";

        // let favourites = state.getFavourites()?.length ? state.getFavourites() : config.items;

        favourites.forEach((favourite) => {
            const item = createItem(favourite);
            const dot = createDot();

            list.appendChild(item);
            dotsContainer.appendChild(dot);
        });
    }

    const updateClasses = () => {
        const elements = getElements();
        if (!elements) return;
        const currentIndex = state.getCurrentIndex();
        const previousIndex = state.getPreviousIndex();

        const glassBackgroundClass = config.classes.glassBackground;
        const selectedItemClass = config.classes.selectedItem;
        const selectedDotClass = config.classes.selectedDot;
        
        if (elements.items[previousIndex]) {
            elements.items[previousIndex].classList.remove(selectedItemClass, glassBackgroundClass);
        }

        if (elements.items[currentIndex]) {
            elements.items[currentIndex].classList.add(selectedItemClass, glassBackgroundClass);
        }

        if (elements.dots[previousIndex]) {
            elements.dots[previousIndex].classList.remove(selectedDotClass);
        }

        if (elements.dots[currentIndex]) {
            elements.dots[currentIndex].classList.add(selectedDotClass);
        }
    };

    const moveItems = (targetIndex) => {
        const elements = getElements();
        if (!elements?.items?.[0]) return;

        const itemWidth = parseFloat(getComputedStyle(elements.items[0]).width);
        const leftPosition = -targetIndex * itemWidth;
        elements.list.style.left = `${leftPosition}px`;
    };

    const initialize = () => {
        if (isInitialized) return;
        cacheElements();
        isInitialized = true;
    };

    const destroy = () => {
        elements = null;
        isInitialized = false;
        rootElement.innerHTML = "";
    };

    const getElements = () => {
        cacheElements();
        return elements;
    };

    return {
        initialize,
        destroy,
        moveItems,
        updateClasses,
        getElements,
        displayFavourites,
        get isInitialized() {
            return isInitialized;
        },
    };
};