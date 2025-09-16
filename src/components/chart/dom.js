import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createDOM = (state) => {
    if (!config || !eventBus || !state) {
        throw new Error("config, event bus, and state are required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            canvas: document.querySelector('.charts-panel__canvas'),
            canvasWrapper: document.querySelector('.charts-panel__canvas-wrapper'),
            controls: document.querySelector('.charts-panel__controls'),
            buttons: Array.from(document.querySelectorAll('.charts-panel__controls__btn'))
        };
    };

    const createChart = (processedChartData) => {
        if (!processedChartData) {
            console.warn('No chart data provided');
            eventBus.emit("chart:failed", new Error("No chart data provided"));
            return null;
        }
        if (!elements || !elements.canvas) {
            console.error('Canvas element not available');
            eventBus.emit("chart:failed", new Error("Canvas element not available"));
            return null;
        }

        if (!processedChartData.ordinats || processedChartData.ordinats.length === 0) {
            console.error('Chart ordinats is empty or null for:', processedChartData.name);
            eventBus.emit("chart:failed", new Error("Chart ordinats is empty or null"));
            return null;
        }

        // Destroy only the current chart instance if it exists
        const chartInstance = state.getChartInstance();
        if (chartInstance) {
            clearChart();
        }

        const ctx = elements.canvas.getContext('2d');
        const chartConfig = state.getChartConfig(processedChartData);
        
        if (!chartConfig) {
            console.error('Chart config is null for:', processedChartData.name);
            eventBus.emit("chart:failed", new Error("Chart config is null"));
            return null;
        }

        chartConfig.plugins = [{
            afterDatasetsDraw: (chart) => {
                createInteractiveElements(chart, processedChartData);
            }
        }];

        try {
            const myChart = new Chart(ctx, chartConfig);
            state.setChartInstance(myChart);
            return myChart;
        } catch (error) {
            console.error('Chart creation failed:', error);
            eventBus.emit("chart:failed", error);
            return null;
        }
    };

    const createInteractiveElements = (chart, chartData) => {
        const { abscissas, ordinats, rawOrdinats } = chartData;
        const wrapper = elements.canvasWrapper;
        
        if (!wrapper) return;

        wrapper.querySelectorAll('.charts-panel__canvas__btn--value, .charts-panel__canvas__btn--hour').forEach(b => b.remove());

        const meta = chart.getDatasetMeta(0);
        const chartType = chart.config.type;

        if (chartType === 'bar') { //precip label buttons
            // meta.data.forEach((bar, index) => {
            //     if (index % 3 === 1) {
            //         const btn = createValueButton(bar, index, ordinats, rawOrdinats || ordinats, abscissas, chartData.name, true);
            //         wrapper.appendChild(btn);
            //     }
            // });
        } else {
            meta.data.forEach((point, index) => {
                if (index % 3 === 0) {
                    const btn = createValueButton(point, index, ordinats, rawOrdinats || ordinats, abscissas, chartData.name, false);
                    wrapper.appendChild(btn);
                }
            });
        }

        const xAxis = chart.scales.x;
        xAxis.ticks.forEach((tick, i) => {
            if (i % 3 === 1) {
                const btn = createHourButton(xAxis, tick, i, chart.height);
                wrapper.appendChild(btn);
            }
        });
    };

    const createValueButton = (element, index, ordinats, rawOrdinats, abscissas, chartType, isBar = false) => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'charts-panel__canvas__btn', 'charts-panel__canvas__btn--value');
        btn.style.left = isBar ? `${element.x}px` : `${element.x}px`;
        btn.style.top = isBar ? `10px` : `${element.y - 20}px`;
        
        let displayText = '';
        const value = chartType === 'precip' && ordinats[index] === 0.001 ? 0 : (rawOrdinats[index] !== undefined ? rawOrdinats[index] : ordinats[index]);
        
        switch (chartType) {
            case 'temperature':
                eventBus.emit("unit:temperature-symbol-requested", {
                    respond: (symbol) => {
                        btn.textContent = Math.round(value) + symbol;
                    }
                });
                break;
            case 'precip':
                eventBus.emit("unit:precipitation-symbol-requested", {
                    respond: (symbol) => {
                        btn.textContent = (value < 0.1 ? value.toFixed(3) : value.toFixed(2)) + symbol;
                    }
                });
                break;
            case 'wind':
                eventBus.emit("unit:speed-symbol-requested", {
                    respond: (symbol) => {
                        btn.textContent = Math.round(value) + symbol;
                    }
                });
                break;
            default:
                btn.textContent = (value < 0.1 ? value.toFixed(2) : Math.round(value));
        }
        
        setTimeout(() => {
            if (!btn.textContent || btn.textContent === '') {
                switch (chartType) {
                    case 'temperature':
                        btn.textContent = Math.round(value) + '°';
                        break;
                    case 'precip':
                        btn.textContent = (value < 0.1 ? value.toFixed(3) : value.toFixed(2)) + 'mm';
                        break;
                    case 'wind':
                        btn.textContent = Math.round(value);
                        eventBus.emit("unit:speed-unit-requested", (unit) => {
                            btn.textContent += unit;
                        });
                        break;
                    default:
                        btn.textContent = (value < 0.1 ? value.toFixed(2) : Math.round(value));
                }
            }
        }, 10);
        
        btn.onclick = () => {
            const formattedHour = abscissas[index].substring(0, 5);
            const clickValue = chartType === 'precip' && ordinats[index] === 0.001 ? 0 : (rawOrdinats[index] !== undefined ? rawOrdinats[index] : ordinats[index]);
            eventBus.emit('chart:value-clicked', {
                hour: formattedHour,
                value: clickValue,
                chartType: chartType,
                index
            });
        };
        
        return btn;
    };

    const createHourButton = (xAxis, tick, index, chartHeight) => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'charts-panel__canvas__btn', 'charts-panel__canvas__btn--hour');
        btn.style.left = xAxis.getPixelForTick(index) + 'px';
        btn.style.top = (chartHeight + remToPixels(0)) + 'px';
        
        const formattedHour = xAxis.getLabelForValue(tick.value).substring(0, 5);
        btn.textContent = formattedHour;
        
        btn.onclick = () => {
            eventBus.emit('chart:hour-clicked', {
                hour: formattedHour,
                fullHour: xAxis.getLabelForValue(tick.value),
                index,
            });
        };
        
        return btn;
    };

    const clearChart = () => {
        const chartInstance = state.getChartInstance();
        if (chartInstance) {
            chartInstance.destroy();
            state.setChartInstance(null);
        }

        if (elements && elements.canvas) {
            const ctx = elements.canvas.getContext('2d');
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }
        }

        if (elements && elements.canvasWrapper) {
            elements.canvasWrapper.querySelectorAll('.charts-panel__canvas__btn--value, .charts-panel__canvas__btn--hour').forEach(b => b.remove());
        }
    };

    const initialize = () => {
        if (isInitialized) return;
        
        cacheElements();
        
        if (!elements.canvas) {
            return;
        }
        
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        clearChart();
        elements = null;
        isInitialized = false;
    };

    const getElements = () => {
        if (!elements) {
            cacheElements();
        }
        return elements;
    };

    const updateChartColors = (borderColor, backgroundColor) => {
        const chartInstance = state.getChartInstance();
        if (!chartInstance) {
            console.log('Must initiliaze chart instance first.');
            return;
        }

        chartInstance.data.datasets[0].borderColor = borderColor || 'rgba(255, 234, 186, 1)';
        chartInstance.data.datasets[0].backgroundColor = backgroundColor || 'rgba(251, 238, 208, 0.5)';
        
        chartInstance.update('none');
    };

    const setChartTheme = (theme = 'default') => {
        const themes = {
            default: {
                border: 'rgba(255, 234, 186, 1)',
                background: 'rgba(251, 238, 208, 0.5)'
            },
            temperature: {
                border: 'rgba(255, 159, 64, 1)',
                background: 'rgba(255, 159, 64, 0.3)'
            },
            precip: {
                border: 'rgba(54, 162, 235, 1)',
                background: 'rgba(54, 162, 235, 0.1)'
            },
            wind: {
                border: 'rgba(75, 192, 192, 1)',
                background: 'rgba(75, 192, 192, 0.3)'
            },
            blue: {
                border: 'rgba(54, 162, 235, 1)',
                background: 'rgba(54, 162, 235, 0.3)'
            },
            green: {
                border: 'rgba(75, 192, 192, 1)',
                background: 'rgba(75, 192, 192, 0.3)'
            },
            purple: {
                border: 'rgba(153, 102, 255, 1)',
                background: 'rgba(153, 102, 255, 0.3)'
            },
            orange: {
                border: 'rgba(255, 159, 64, 1)',
                background: 'rgba(255, 159, 64, 0.3)'
            },
            red: {
                border: 'rgba(255, 99, 132, 1)',
                background: 'rgba(255, 99, 132, 0.3)'
            }
        };

        const selectedTheme = themes[theme] || themes.default;
        updateChartColors(selectedTheme.border, selectedTheme.background);
        
        eventBus.emit('chart:theme-changed', { theme, colors: selectedTheme });
    };

    const updateClasses = (newChartIndex) => {
        const buttons = elements.buttons;
        buttons.forEach((btn, i) => {
            if (i === newChartIndex) {
                btn.classList.add('glass-background');
            } else {
                btn.classList.remove('glass-background');
            }
        });
    }

    const remToPixels = (rem) => {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    };

    return {
        initialize,
        destroy,
        getElements,
        createChart,
        clearChart,
        updateChartColors,
        setChartTheme,
        updateClasses,
        get isInitialized() {
            return isInitialized;
        }
    };
};