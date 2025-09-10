export const createEventBus = () => {
    const eventListeners = {}; // event: [handler1, handler2, handler3,...]

    const on = (event, listener) => {
        if (typeof listener !== "function") {
            throw new Error(`Listener must be a function, got ${typeof listener}`);
        }

        if(!eventListeners[event]) eventListeners[event] = [];
        eventListeners[event].push(listener);
    }

    const emit = (event, data) => {
        if(eventListeners[event]) {
            eventListeners[event].forEach(listener => listener(data));
        }
    }
    
    const off = (event, listener) => {
        if(!eventListeners[event]) return;
        eventListeners[event] = eventListeners[event].filter(l => l !== listener);
    }

    return {
        on,
        off,
        emit,
        get eventListeners(){
            return eventListeners;
        }
    }
}

const eventBus = createEventBus();
export {eventBus};