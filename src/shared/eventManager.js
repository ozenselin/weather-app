export const createEventManager = () => {
    let eventHandlers = []; //{element, event, handler}
    
    const addEventListener = (element, event, handler) => {
        if(!element) return;
        element.addEventListener(event, handler);
        eventHandlers.push({
            element,
            event,
            handler
        });
    }

    const removeEventListener = (element, event, handler) => {
        if(!element) return;
        element.removeEventListener(event, handler);
        eventHandlers = eventHandlers.filter(({element: el, event: ev, handler: h}) => {
            return el === element
                && ev === event
                && h === handler;
        });
    }

    const removeEventListeners = () => {
        eventHandlers.forEach(({element, event, handler}) => {
            element.removeEventListener(event, handler);
        });
        eventHandlers.length = 0;
    }

    const destroy = () => {
        removeEventListeners();
        eventHandlers = null;
    }

    return {
        addEventListener,
        removeEventListener,
        removeEventListeners,
        get eventHandlers(){
            return eventHandlers;
        }
    }
}