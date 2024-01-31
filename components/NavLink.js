
/**
 * @typedef {import('../state.js').State} State
 */

class NavLink extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div>
        <a class="nav-link" href=""></a>
      </div>
    `;
  }

  /**
   *
   * @param {string} newTabId
   */
  onTabChange(newTabId) {
    const _a = this.querySelector("a.nav-link");
    if (this.tabId == newTabId) {
      _a.className = `${_a.className} active`;
    } else {
      _a.className = _a.className.split("active").join("");
    }
  }

  /**
   *
   * @param {string} tabId
   * @param {string} name
   * @param {string} url
   * @param {State} state
   */
  render(tabId, name, url, state) {
    this.tabId = tabId;
    const _a = this.querySelector("a.nav-link");
    _a.className = `nav-link nav-link-${tabId} ${tabId == state.activeTab ? "active" : ""}`;
    _a.setAttribute("href", url)
    _a.innerHTML = name;

    state.subscribe((e) => {
      if(e.tab !== undefined) {
        this.onTabChange(e.tab);
      }
    });
  }
}

customElements.define('nav-link', NavLink)