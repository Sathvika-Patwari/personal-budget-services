import { matchImageSnapshot } from 'cypress-image-snapshot';

describe('Visual Regression Tests', () => {
  it('should match the login page snapshot', () => {
    cy.visit('/'); 
    cy.get('#your-login-page-element').should('be.visible'); 
    cy.wait(500); 

    cy.document().toMatchImageSnapshot();
  });
});
