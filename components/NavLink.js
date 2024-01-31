class NavLink extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div>
        <a class="nav-link" href=""></a>
      </div>
    `;
  }

  onTabChange(newTabId) {
    const _a = this.querySelector("a.nav-link");
    if (this.tabId == newTabId) {
      _a.className = `${_a.className} active`;
    } else {
      _a.className = _a.className.split("active").join("");
    }
  }

  render(tabId, name, url, state) {
    this.tabId = tabId;
    const _a = this.querySelector("a.nav-link");
    _a.className = `nav-link nav-link-${tabId} ${tabId == state.activeTab ? "active" : ""}`;
    _a.setAttribute("href", url)
    _a.innerHTML = name;

    state.subscribe((newTabId) => {
      this.onTabChange(newTabId);
    });
  }
}

customElements.define('nav-link', NavLink)