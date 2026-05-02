/// <reference types="cypress" />

import { homeSelectors } from '../selectors/home.selectors.js'
import { productSelectors } from '../selectors/product.selectors.js'
import { cartSelectors } from '../selectors/cart.selectors.js'
import { orderSelectors } from '../selectors/order.selectors.js'
import { getCurrentMonth, getCurrentYear, getTodayFormatted } from '../utils/date.utils.js'

context('Successful purchase flow', () => {
  beforeEach(() => {
    cy.login()
    cy.fixture('user-info').as('userInfo')
  })

  it('Should purchase a product successfully', function () {
    const { userInfo } = this
    const productName = 'MacBook Pro'
    const currentMonth = getCurrentMonth()
    const currentYear = getCurrentYear()
    let productPrice

    cy.visit('/')
    cy.get(homeSelectors.laptopsCategory).contains('Laptops').click()
    cy.get(productSelectors.cardTitle).contains(productName).click()
    cy.url().should('include', '/prod.html')

    cy.get(productSelectors.priceContainer)
      .first()
      .invoke('text')
      .then((text) => {
        const raw = text.match(/\$\d+/)?.[0] ?? text.trim()
        productPrice = raw.replace(/^\$/, '')
      })

    cy.contains(productSelectors.addToCartButton, productSelectors.addToCartText)
      .should('be.visible')
      .click()
    cy.get(homeSelectors.cartLink).contains('Cart').click()
    cy.url().should('include', '/cart.html')
    cy.get(cartSelectors.cartTableBodyRows).should('have.length', 1)

    cy.contains(cartSelectors.totalHeading, 'Total')
      .closest(cartSelectors.totalSection)
      .find(cartSelectors.cartTotalAmountCell)
      .should(($el) => {
        expect($el.text()).to.equal(productPrice)
      })

    cy.contains(orderSelectors.placeOrderButton, orderSelectors.placeOrderText)
      .should('be.visible')
      .click()

    cy.get(orderSelectors.modal).should('be.visible')
    cy.get(orderSelectors.modalTitle).should('contain', 'Place order')

    cy.get(orderSelectors.totalLabel)
      .scrollIntoView({ block: 'center', inline: 'nearest' })
      .should(($el) => {
        expect($el.text()).to.include(productPrice)
      })

    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.nameInput}`, userInfo.customerName)
    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.countryInput}`, userInfo.country)
    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.cityInput}`, userInfo.city)
    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.cardInput}`, userInfo.cardNumber)
    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.monthInput}`, currentMonth)
    cy.fillInputField(`${orderSelectors.modal} ${orderSelectors.yearInput}`, currentYear)

    cy.get(orderSelectors.modal)
      .contains(orderSelectors.purchaseButton, orderSelectors.purchaseText)
      .scrollIntoView({ block: 'center', inline: 'nearest' })
      .click()

    cy.get(orderSelectors.confirmation, { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Thank you for your purchase!')
      .within(() => {
        cy.get(orderSelectors.confirmationBody)
          .invoke('text')
          .should((text) => {
            expect(text).to.satisfy(
              (t) =>
                /Id:\s*\d+/.test(t) && // check if the text contains the word "Id:" and a number
                t.includes(`Amount: ${productPrice} USD`) &&
                t.includes(`Card Number: ${userInfo.cardNumber}`) &&
                t.includes('Name:') &&
                t.includes(userInfo.firstName) &&
                /Date:\s*\d+\/\d+\/\d+/.test(t) &&
                /*
                 * TODO: There is a bug in the confirmation dialog where 
                 * the date is displayed one month behind the current month
                 * after frontend fix, we can validate date as well.
                */
                // t.includes(`Date: ${getTodayFormatted()}`),
                `confirmation body: "${text}"`,
            )
          })
        cy.get(orderSelectors.confirmationOk).contains('OK').click()
      })
  })
})
