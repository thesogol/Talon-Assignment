# Talon Assignment — Cypress E2E Test Suite

Automated end-to-end tests for [Demoblaze](https://www.demoblaze.com), covering the full user journey from login and product browsing through to order confirmation.

---

## Prerequisites

Before running the tests, make sure you have the following installed on your machine:

- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org)
- **npm** (comes bundled with Node.js)

To verify your installation, open a terminal and run:

```bash
node -v
npm -v
```

Both commands should print a version number. If they do, you're ready to proceed.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/thesogol/Talon-Assignment
cd talon-assignment
```

### 2. Install dependencies

```bash
npm install
```

This installs all project dependencies, including Cypress.

### 3. Install Cypress

This project uses **Cypress 15.14.2**. If you want to install the latest version of Cypress globally or add it to a fresh project, run:

```bash
npm install cypress@latest --save-dev
```

To verify Cypress is installed correctly:

```bash
npx cypress verify
```

You should see a message confirming the Cypress binary is installed and ready.

---

## Running the Tests

### Option A — Interactive mode (recommended for local development)

Opens the Cypress Test Runner UI where you can watch tests run step by step in a real browser:

```bash
npm run cy:open
```

1. Select **E2E Testing** when prompted.
2. Choose a browser (Chrome is recommended).
3. Click on `purchase-flow.cy.js` to run the test.

### Option B — Headless mode (for CI or a quick full run)

Runs all tests in the terminal without opening a browser:

```bash
npm run cy:run
```

Results are printed directly in the terminal. A screenshot is saved automatically if a test fails.

---

## Configuration

All Cypress settings live in `cypress.config.js`.

| Setting | Value | Why |
|---------|-------|-----|
| `baseUrl` | `https://www.demoblaze.com` | All `cy.visit('/')` calls resolve relative to this, so URLs stay short and portable |
| `viewportWidth / Height` | `1280 × 720` | Standard desktop resolution; ensures layout-dependent elements are visible |
| `retries` | `1` (run and open) | Automatically retries a flaky test once before marking it as failed |
| `screenshotOnRunFailure` | `true` | Saves a screenshot at the exact point of failure for easier debugging |
| `video` | `false` | Disabled to keep CI runs fast; enable by setting to `true` if you need a recording |

---

## Project Structure

```
cypress/
├── e2e/
│   └── purchase-flow.cy.js       # Test spec
├── fixtures/
│   ├── login-credentials.json    # Login username & password
│   └── user-info.json            # Checkout form data (name, card, address)
├── selectors/
│   ├── home.selectors.js         # Homepage element selectors
│   ├── login.selectors.js        # Login modal selectors
│   ├── product.selectors.js      # Product page selectors
│   ├── cart.selectors.js         # Cart page selectors
│   └── order.selectors.js        # Order modal & confirmation selectors
├── support/
│   ├── e2e.js                    # Global setup (loaded before every test)
│   └── commands.js               # Custom Cypress commands (cy.login, cy.fillInputField)
└── utils/
    └── date.utils.js             # Date helpers (current month/year)
```

---

## Test Approach

### What is being tested

The test covers the **critical happy path** of an e-commerce purchase:

| Step | What is verified |
|------|-----------------|
| Login | User can authenticate and session is established |
| Browse | Laptops category loads and the target product is visible |
| Product page | Page URL changes and price is captured correctly |
| Add to cart | Product is added and cart shows exactly one item |
| Cart total | Sidebar total matches the product price from the product page |
| Order form | Modal opens, pre-filled total matches, all fields accept input |
| Confirmation | SweetAlert shows "Thank you for your purchase!" with correct Id, Amount, Card Number, Name, and Date |

### Why this flow was chosen

The purchase flow is the **core business transaction** of the application. If any step in this chain breaks — login, cart, checkout, confirmation — the user cannot complete a purchase. Testing this end-to-end gives the highest confidence that the most critical path is working.

### Design decisions

**Selector files per page (`selectors/`)**
All CSS selectors are centralised in dedicated files. If the application changes a class name or element ID, only one file needs updating — no hunting through test code.

**Fixtures for test data (`fixtures/`)**
User credentials and personal information are kept in JSON files, not hardcoded in tests. Changing a test user or card number requires editing one file.

**Dynamic date (`utils/date.utils.js`)**
The order month and year are derived from the current date at runtime so the test never goes stale and no manual updates are needed.

**Custom commands (`support/commands.js`)**
- `cy.login()` — handles authentication with session caching (`cy.session`), so the login only runs once per test suite and is replayed from cache in subsequent tests, keeping runs fast.
- `cy.fillInputField()` — reliably fills inputs that have a `maxlength` attribute or live inside modals. Sets the value programmatically and fires `input`/`change` events so the page's JavaScript picks up the new value.

**Price assertion across pages**
The price read from the product page is stored as a Cypress alias (`@productPrice`) and then verified in two places: the cart sidebar total and the confirmation dialog. This ensures the correct amount flows through the entire transaction.

**Scoped selectors**
Order form interactions use `#orderModal #name` instead of bare `#name`. This limits the search to inside the modal only, preventing accidental matches against hidden or duplicate elements elsewhere on the page.

---

## Challenges & Suggestions

**Login via API instead of UI**
Currently login is handled through the browser. A faster and more reliable approach would be to call the authentication API directly and set the session token — skipping the UI entirely for login. This is a recognised Cypress best practice: only test the login UI once; use the API for all other tests that require an authenticated state.

**Input `maxlength` limitation**
Demoblaze sets a short `maxlength` on the order form's name field, which silently truncates keyboard input. This was worked around using `cy.fillInputField()` which sets the value programmatically. In a real project this would be flagged as a bug.

**No search feature to automate**
If the platform had a search feature, searching for a product by name would be a strong automation candidate — it is a high-traffic user path and regressions there would directly impact sales.

**Additional flows worth automating**
- Adding multiple products and verifying the combined cart total
- Attempting checkout with missing or invalid form fields
- Verifying the cart persists across page refreshes (session integrity)
