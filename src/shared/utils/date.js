const getDateFromUTCOffset = (offsetHours) => {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    return new Date(utcNow.getTime() + offsetHours * 3600000);
}

const getUserUTCInfo = () => {
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = -offsetMinutes / 60; // negatiften düzeltme
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
        offsetHours, // örn: 3
        offsetMinutes, // örn: -180
        timeZone      // örn: "Europe/Istanbul"
    };
}

const daysShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const getFormattedDayShort = (weekDayIndex) => daysShort.at(weekDayIndex % 7);//Wed, Thu

const daysLong = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const getFormattedDayLong = (weekDayIndex) => daysLong.at(weekDayIndex % 7);//Wed, Thu

const floorToHour = (timeString) => timeString.split(":")[0] + ":00";

function isBeforeTime(date, timeStr) {
    const [h, m, s] = timeStr.split(":").map(Number);
    const target = new Date(date);
    target.setHours(h, m, s, 0); 
    return date < target;
}

function addHoursToTime(timeStr, hoursToAdd) {
    const [h, m, s] = timeStr.split(":").map(Number);

    const date = new Date(1970, 0, 1, h, m, s);

    date.setHours(date.getHours() + hoursToAdd);

    const pad = n => n.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const getFormattedHourByIndex = (hour) => {
    if (typeof hour !== "number" || hour < 0 || hour > 23) return "invalid hour";
    return `${hour.toString().padStart(2, "0")}:00`;
};

export {
    getDateFromUTCOffset,
    getUserUTCInfo,
    getFormattedDayShort,
    getFormattedDayLong,
    floorToHour,
    isBeforeTime,
    addHoursToTime,
    getFormattedHourByIndex,
};