import request from 'supertest';
import app from '../app.js';

describe('GET /health', () => {
  it('should return the API health status', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('UP');
  });
});
