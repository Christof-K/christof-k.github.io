/**
 * @typedef {import('../state.js').State} State
 */

class Tab extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div></div>`;
    this.className = "tab";
  }

  onTabChange(newTabId) {
    if (this.tabId == newTabId) {
      this.className = `${this.className} active`;
    } else {
      this.className = this.className.split("active").join("");
    }
  }

  /**
   *
   * @param {string} tabId
   * @param {State} state
   */
  render(tabId, state) {
    this.tabId = tabId;
    this.className = `${this.className} ${tabId} ${
      tabId == state.activeTab ? "active" : ""
    }`;
    state.subscribe((e) => {
      if (e.tab !== undefined) {
        this.onTabChange(e.tab);
      }
    });
  }
}

customElements.define("tab-item", Tab);
