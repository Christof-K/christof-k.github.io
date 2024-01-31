export default class State {
  constructor() {
    this.subscribers = []
  }

  set activeTab(tab) {
    this.tab = tab
    for (const sub of this.subscribers) {
      sub(tab)
    }

  }

  get activeTab() {
    return this.tab
  }

  subscribe(callback) {
    this.subscribers.push(callback)
  }
}
