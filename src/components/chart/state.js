import { config } from "../../shared/config.js";
import { eventBus } from "../../shared/eventBus.js";
import { floorToHour } from "../../shared/utils/date.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let chartIndex = 0; // 0, 1, 2: types are temperature, precip, wind
    let isInitialized = false;
    let chartInstance = null;
    let chartDatas = [];

    const getChartIndex = () => chartIndex;

    const setChartIndex = (newIndex) => {
        if (newIndex == null || newIndex < 0 || newIndex > 2) return;
        chartIndex = newIndex;
        eventBus.emit("chart:index-changed", chartIndex);
    };

    const setChartDatas = async (forecast, dayIndex) => {
        const processedChartDatas = await processChartDatas(forecast, dayIndex);
        if (!processedChartDatas) {
            return;
        }
        chartDatas = processedChartDatas;
    };

    const getChartDatas = () => {
        if (!chartDatas || chartDatas.length === 0) {
            return null;
        }
        return [...chartDatas];
    };

const processChartDatas = async (forecast, dayIndex) => {
    if (!forecast || dayIndex == null) {
        console.error("forecast data or day index invalid:", { forecast, dayIndex });
        return null;
    }

    const dayData = forecast.days.at(dayIndex);
    if (!dayData || !dayData.hours) {
        console.error("forecast data or day index invalid:", dayData);
        return null;
    }

    const hours = [];
    const temps = [];
    const speeds = [];
    const precips = [];
    const rawPrecips = [];

    const conversionPromises = dayData.hours.map(hour => {
        return new Promise(resolve => {
            hours.push(floorToHour(hour.datetime));
            precips.push(hour.precip);
            rawPrecips.push(hour.precip);

            const conversions = [];
            conversions.push(new Promise(resolveTemp => {
                eventBus.emit("unit:temperature-assignment-requested", {
                    value: hour.temp,
                    fromUnit: 'fahrenheit',
                    respond: (convertedTemperature) => {
                        temps.push(convertedTemperature);
                        resolveTemp();
                    }
                });
            }));
            conversions.push(new Promise(resolveSpeed => {
                eventBus.emit("unit:speed-assignment-requested", {
                    value: hour.windspeed,
                    fromUnit: 'kmh',
                    respond: (convertedSpeed) => {
                        speeds.push(convertedSpeed);
                        resolveSpeed();
                    }
                });
            }));

            Promise.all(conversions).then(resolve);
        });
    });

    await Promise.all(conversionPromises);

    if (temps.length === 0 || precips.length === 0 || speeds.length === 0) {
        console.error("Processed chart data is empty:", { temps, precips, speeds });
        return null;
    }

    const adjustedPrecips = precips.map(p => p === 0 ? 0.001 : p);
    const precipMin = Math.min(...precips);
    const precipMax = Math.max(...precips);

    return [
        {
            name: "temperature",
            abscissas: hours,
            ordinats: temps,
            minvalue: temps.length ? Math.min(...temps) : 0,
            maxvalue: temps.length ? Math.max(...temps) : 100,
        },
        {
            name: "precip",
            abscissas: hours,
            ordinats: adjustedPrecips,
            rawOrdinats: rawPrecips,
            minvalue: precipMin,
            maxvalue: precipMax,
        },
        {
            name: "wind",
            abscissas: hours,
            ordinats: speeds,
            minvalue: speeds.length ? Math.min(...speeds) : 0,
            maxvalue: speeds.length ? Math.max(...speeds) : 100,
        }
    ];
};

const getChartConfig = (processedData) => {
    const { abscissas, ordinats, minvalue, maxvalue, name, rawOrdinats } = processedData;

    if (!abscissas || !ordinats || abscissas.length === 0 || ordinats.length === 0) {
        console.error('Invalid chart data:', { abscissas, ordinats });
        eventBus.emit("chart:failed", new Error("Invalid chart data"));
        return null;
    }

    const chartConfigs = {
        default: {
            label: "default",
            borderColor: 'rgba(255, 234, 186, 1)',
            backgroundColor: 'rgba(251, 238, 208, 0.5)',
        },
        temperature: {
            label: 'Temperature (°C)',
            borderColor: 'rgba(255, 234, 186, 1)',
            backgroundColor: 'rgba(251, 238, 208, 0.5)'
        },
        precip: {
            label: 'Precipitation (mm)',
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
        },
        wind: {
            label: 'Wind Speed (km/h)',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.3)'
        }
    };

    const currentConfig = chartConfigs[name] || chartConfigs.default;

    const safeMinValue = isFinite(minvalue) ? minvalue : 0;
    const safeMaxValue = isFinite(maxvalue) ? maxvalue : 100;

    const chartType = name === 'precip' ? 'bar' : 'line';

    const range = safeMaxValue - safeMinValue;
    const precipMax = name === 'precip' ? Math.max(0.02, range * 2) : null;

    return {
        type: chartType,
        data: {
            labels: abscissas,
            datasets: [{
                label: currentConfig.label,
                data: ordinats,
                borderWidth: chartType === 'bar' ? { top: 4, left: 0, right: 0, bottom: 0 } : 5,
                borderColor: currentConfig.borderColor,
                backgroundColor: currentConfig.backgroundColor,
                fill: chartType === 'line',
                tension: chartType === 'line' ? 0.3 : 0,
                pointRadius: chartType === 'line' ? 0 : undefined,
                barPercentage: chartType === 'bar' ? 1.0 : undefined,
                categoryPercentage: chartType === 'bar' ? 1.0 : undefined,
                borderRadius: chartType === 'bar' ? 0 : undefined,
                borderSkipped: chartType === 'bar' ? false : undefined
            }],
        },
        options: {
            layout: {
                padding: {
                    bottom: 0,
                    top: 0,
                    left: 0,
                    right: 0
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: name === 'precip',
                    callbacks: {
                        label: (context) => {
                            const value = name === 'precip' && rawOrdinats ? rawOrdinats[context.dataIndex] : context.raw;
                            return (value < 0.1 ? value.toFixed(3) : value.toFixed(2)) + ' mm';
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    border: { display: false },
                    ticks: {
                        callback: function() { return ''; },
                        width: 0,
                        height: 0,
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        align: 'center',
                        padding: 0
                    },
                    grid: { display: false, drawTicks: false }
                },
                y: { 
                    border: { display: false },
                    title: { display: false, text: currentConfig.label },
                    max: precipMax ? precipMax : maxvalue + 3,
                    min: precipMax ? 0: minvalue - 3,
                    beginAtZero: true,
                    offset: name === 'precip' ? false : undefined,
                    grid: { 
                        display: false, 
                        drawTicks: false,
                        drawBorder: false,
                        offset: false
                    },
                    ticks: { 
                        display: false,
                        padding: name === 'precip' ? 0 : undefined
                    }
                }
            }
        }
    };
};

    const getChartInstance = () => chartInstance;

    const setChartInstance = (newChartInstance) => {
        chartInstance = newChartInstance;
    };

    const initialize = () => {
        if (isInitialized) return;
        chartIndex = 0;
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = null;
        chartDatas = [];
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        getChartIndex,
        setChartIndex,
        setChartDatas,
        getChartDatas,
        getChartConfig,
        getChartInstance,
        setChartInstance,
        get isInitialized() {
            return isInitialized;
        }
    };
};