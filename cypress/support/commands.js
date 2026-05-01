import { loginSelectors } from '../selectors/login.selectors.js'
import { homeSelectors } from '../selectors/home.selectors.js'

/**
 * Fills an input field reliably: removes `maxlength`, sets the value programmatically,
 * and fires input/change events so the page's JS picks up the new value.
 * Use instead of `.type()` for fields that truncate or live inside modals.
 */
Cypress.Commands.add('fillInputField', (selector, value) => {
  cy.get(selector)
    .scrollIntoView({ block: 'center', inline: 'nearest' })
    .should('be.visible')
    .then(($el) => {
      $el[0].removeAttribute('maxlength')
    })
    .clear()
    .invoke('val', value)
    .trigger('input')
    .trigger('change')
    .should('have.value', value)
})

Cypress.Commands.add('login', () => {
  cy.fixture('login-credentials').then((credentials) => {
    const user = credentials.validUser

    cy.session([user.username, user.password], () => {
      cy.visit('/')

      cy.get(homeSelectors.loginLink).click()
      cy.get(loginSelectors.modal).should('be.visible').within(() => {
        cy.get(loginSelectors.modalTitle)
          .should('be.visible')
          .and('have.text', 'Log in')

        cy.fillInputField(loginSelectors.usernameInput, user.username)
        cy.fillInputField(loginSelectors.passwordInput, user.password)

        cy.get(loginSelectors.submitButton).contains(loginSelectors.submitText).click()
      })

      cy.get(homeSelectors.usernameDisplay).should('contain.text', user.username)
    })
  })
})
