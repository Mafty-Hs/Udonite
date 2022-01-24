import { EventSystem as _EventSystem } from './event/event-system';
import { IONetwork as _IONetwork } from './socketio/ionetwork';

export { Event } from './event/event';
export { Listener } from './event/listener';

export const EventSystem = _EventSystem.instance;
export const IONetwork = _IONetwork.instance;
