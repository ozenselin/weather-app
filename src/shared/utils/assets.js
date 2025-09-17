const icons = require.context("../../assets/weather-icons", false, /\.png$/);

export const getIconPath = (iconName) => {
  try {
    return icons(`./${iconName}.png`);
  } catch {
    console.warn(`İkon bulunamadı: ${iconName}`);
    return "";
  }
};

const backgrounds = require.context("../../assets/backgrounds", false, /\.webp$/);

export const getBackgroundPath = (iconName) => {
  try {
    return backgrounds(`./${iconName}.webp`);
  } catch {
    console.warn(`Background bulunamadı: ${iconName}`);
    return "";
  }
};