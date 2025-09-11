import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (state, dom) => {
    if (!state || !dom || !config || !eventBus) {
        throw new Error("state, dom, config, and event bus are required");
    }

    let elements = null;
    let eventManager = null;
    let isInitialized = false;

    // Event handlers for chart interactions
    const handleTemperatureClick = (data) => {
        console.log("handleTemperatureClick", data);
        const {index} = data;
        eventBus.emit("weather:hour-change-requested", index);
    };

    const handleHourClick = (data) => { //fullhour //hour //index
        const {index} = data;
        eventBus.emit("weather:hour-change-requested", index);
    };

    const handleChartError = (error) => {
        console.error('Chart error:', error);
        // You could show user-friendly error message here
        console.log('Chart loading error.');
    };

    const handleForecastChange = ({forecast}) => {
        console.log("Forecast received:", forecast);
        state.setChartIndex(0);
        dom.updateClasses(0);
        handleDayIndexChange({forecast, dayIndex: 0});
    };

    const handleDayIndexChange = async ({forecast, dayIndex}) => {
        await state.setChartDatas(forecast, dayIndex); // Await async operation
        dom.clearChart();
        
        const currentChartDatas = state.getChartDatas();
        if (currentChartDatas && currentChartDatas.length > 0) {
            const currentIndex = state.getChartIndex();
            dom.createChart(currentChartDatas[currentIndex]);
        } else {
            console.error("No chart data available after processing for dayIndex:", dayIndex);
            eventBus.emit("chart:failed", new Error("No chart data available"));
        }
    };

    const handleControlsClick = (event) => {
        console.log("Controls clicked:", event);
        const button = event.target.closest("button");
        
        if (!button) return;
        
        const buttons = elements.buttons;
        const index = buttons.findIndex(btn => btn === button);
        
        console.log("Selected chart index:", index);
        
        if (index === -1) return;
        
        dom.updateClasses(index);
        
        state.setChartIndex(index);
        
        dom.clearChart();
        
        // render new chart
        const chartDatas = state.getChartDatas();
        if (chartDatas && chartDatas[index]) {
            console.log("Rendering chart for:", chartDatas[index].name);
            dom.createChart(chartDatas[index]);
        } else {
            console.error("Chart data not found for index:", index);
        }
    };

    const handleChartIndexChange = (newIndex) => {
        console.log("Chart index changed to:", newIndex);
        
        const chartDatas = state.getChartDatas();
        if (chartDatas && chartDatas[newIndex]) {
            dom.clearChart();
            dom.createChart(chartDatas[newIndex]);
        }
    };

    const setupEventListeners = () => {
        elements = dom.getElements();
        const canvas = elements.canvas;
        const controls = elements.controls;
        
        eventManager.addEventListener(controls, "click", handleControlsClick);

        //setup custom event listners
        eventBus.on("weather:forecast-changed", handleForecastChange);
        eventBus.on("weather:day-changed", handleDayIndexChange);

        //internal events
        eventBus.on("chart:index-changed", handleChartIndexChange);
        eventBus.on('chart:value-clicked', handleTemperatureClick);
        eventBus.on('chart:hour-clicked', handleHourClick);
        eventBus.on('chart:failed', handleChartError);
    };

    const removeEventListeners = () => {
        if (eventManager) {
            eventManager.removeEventListeners();
        }
        eventBus.off("weather:forecast-changed", handleForecastChange);
        eventBus.off("weather:day-changed", handleDayIndexChange);
        eventBus.off("chart:index-changed", handleChartIndexChange);
        eventBus.off('chart:value-clicked', handleTemperatureClick);
        eventBus.off('chart:hour-clicked', handleHourClick);
        eventBus.off('chart:failed', handleChartError);
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
        eventManager = null;
        elements = null;
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