const request = require('supertest');
const app = require('./server'); 

describe('API Tests', () => {
  let authToken;

  it('should log in the user and get JWT token', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    authToken = response.body.token; 
  });

  it('should extend the expiration of the JWT token', async () => {
    const response = await request(app)
      .post('/api/extend-token')
      .set('Authorization', `Bearer ${authToken}`); 

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Token extended successfully');
    expect(response.body).toHaveProperty('token');
    authToken = response.body.token; 
  });

  it('should get budget data for the user', async () => {
    const response = await request(app)
      .get('/api/budget/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
  });

  it('should update the budget with the given budgetId', async () => {
    const response = await request(app)
      .put('/api/budget/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ month: 'January', year: '2023', title: 'Updated Budget', budget: 1000 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Budget updated successfully');
  });

  it('should add a new budget for the user', async () => {
    const response = await request(app)
      .post('/api/budget/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ month: 'February', year: '2023', title: 'New Budget', budget: 1500, color: 'blue' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Budget added successfully');
  });

  it('should delete the budget with the given budgetId', async () => {
    const response = await request(app)
      .delete('/api/budget/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Budget deleted successfully');
  });
});