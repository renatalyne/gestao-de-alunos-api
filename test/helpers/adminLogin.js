import request from 'supertest';
import app from '../../src/app.js';

export async function loginComoAdmin() {
    const resposta = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@escola.com',
            senha: 'admin123'
        });

    return resposta.body.token;
}