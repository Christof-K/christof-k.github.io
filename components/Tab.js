class Tab extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div></div>`;
    this.className = "tab";
  }

  onTabChange(newTabId) {
    console.log("ontabchange triggered in", this);
    if (this.tabId == newTabId) {
      this.className = `${this.className} active`;
    } else {
      this.className = this.className.split("active").join("");
    }
  }

  render(tabId, state) {
    this.tabId = tabId;
    this.className = `${this.className} ${tabId} ${tabId == state.activeTab ? "active" : ""}`;
    state.subscribe((newTabId) => {
      this.onTabChange(newTabId);
    });
  }
}

customElements.define("tab-item", Tab)