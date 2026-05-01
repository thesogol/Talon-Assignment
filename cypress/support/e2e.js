import './commands'

// Demoblaze throws uncaught JS errors unrelated to the test flow (e.g. third-party scripts).
// Returning false prevents Cypress from failing the test for those.
Cypress.on('uncaught:exception', () => false)
