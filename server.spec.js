describe('My E2E Tests', () => {
    it('should visit the homepage', () => {
      cy.visit('/');
      cy.contains('Welcome to My App'); 
    });
  
    it('should test login functionality', () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('testpassword');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  
  });
  