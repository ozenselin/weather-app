const DEFAULT_LOCATION = {
    id: 803267,
    name: "Paris",
    region: "Ile-de-France",
    country: "France",
    lat: 48.87,
    lon: 2.33,
    url: "paris-ile-de-france-france",
    get fullName() {
        return `${this.name}, ${this.region}, ${this.country}`;
    }
}

const DEFAULT_API = {
    visualCrossing: {
        apiKey: 'S5B63SUQYAHHR6T2ABVGGG6MS',
        baseUrl: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
        defaultParams: 'unitGroup=us&include=events,hours,alerts,current&contentType=json'
    },
    weatherApi: {
        apiKey: '14c0807c33354dd6b0e173744252908',
        baseUrl: 'https://api.weatherapi.com/v1'
    }
}

const DEFAULT_SCALE = {
    HIGHEST: 1.4,
    STEP: 0.2,
};

const DEFAULT_CLASSES = {
    list: "favourites__list",
    item: "favourites__list__item",
    itemButton: "favourites__list__item__btn",
    dotsContainer: "favourites__indicators",
    dot: "favourites__dot",
    button: "favourites__navigation__btn",
    nextButton: "favourites__navigation__btn--next",
    previousButton: "favourites__navigation__btn--previous",
    selectedItem: "favourites__list__item--active",
    selectedDot: "favourites__dot--active",
    button: "btn",
    glassBackground: "glass-background",
    addButton: "header__controls__btn--add",
};

const DEFAULT_ITEMS = [
    { city: "Tokyo", currentTemp: 28, minTemp: 17, maxTemp: 29, condition: "Rain", location: {id: 1}},
    { city: "New York", currentTemp: 33, minTemp: 23, maxTemp: 36, condition: "Rain", location: {id: 2}},
    { city: "Istanbul", currentTemp: 37, minTemp: 25, maxTemp: 39, condition: "Rain", location:{id: 3} },
    { city: "Oslo", currentTemp: 21, minTemp: 15, maxTemp: 24, condition: "Rain", location:{id: 4} },
];

const DEFAULT_MAX_ITEMS = 8;

export const favourites = {
    scale: DEFAULT_SCALE,
    classes: DEFAULT_CLASSES,
    items: DEFAULT_ITEMS,
    maxItems: DEFAULT_MAX_ITEMS,
};

export const config = {
    location: DEFAULT_LOCATION,
    api: DEFAULT_API,
}

export const createConfig = (userConfig = {}) => {
    return {
        ...config,
        ...userConfig
    }
}