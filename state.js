/**
 * @typedef {Object} StateEvent
 * @property {string|undefined} tab
 * @property {(tab: string)} setTab
 */
class StateEvent {
  tab = undefined;

  get tab() {
    return this.tab;
  }
  set setTab(tab) {
    this.tab = tab;
  }
}

/**
 * @typedef {Object} State
 * @property {(tab: string|undefined)} activeTab - Set the active tab and notify subscribers.
 * @property {() => string|undefined} activeTab - Get the current active tab value.
 * @property {(callback: (event: StateEvent) => void) => void} subscribe - Subscribe to state change events.
 */
export default class State {
  constructor() {
    this.subscribers = [];
  }

  set activeTab(tab) {
    this.tab = tab;
    for (const sub of this.subscribers) {
      const e = new StateEvent();
      e.setTab = tab;
      sub(e);
    }
  }

  get activeTab() {
    return this.tab;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }
}
