import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { novoAluno } from './factories/alunosFactory.js';
import dados from './data/aluno.json' with { type: 'json' };
import { loginComoAdmin } from './helpers/adminLogin.js';
import { loginComoAluno } from './helpers/userLogin.js';

describe('Fluxo do aluno', () => {
    let adminToken;
    let alunoToken;
    let aluno;
    let alunoId;
    let disciplinaId;

    before(async () => {
        //faz o login como administrador e captura o token de autenticação para usar nos testes
        adminToken = await loginComoAdmin();
        
       //cria um novo aluno para usar nos testes
        aluno = novoAluno();
    });

it('Realizar o cadastro do aluno com sucesso', async () => {
    const resposta = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(aluno);
    //console.log(resposta.body);
    expect(resposta.status).to.equal(201);
    expect(resposta.body.nome).to.equal(aluno.nome);
    expect(resposta.body.email).to.equal(aluno.email);
    expect(resposta.body.matricula).to.equal(aluno.matricula);
    //capturando o id do aluno cadastrado para usar nos próximos testes 
    alunoId = resposta.body.id;
});
it('Realizar o cadastro da disciplina com sucesso', async () => {
    const resposta = await request(app)
        .post('/api/admin/disciplinas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            nome: dados.disciplina.nome,
            codigo: `AUT-${Date.now()}`,
            cargaHoraria: dados.disciplina.cargaHoraria
        });

    expect(resposta.status).to.equal(201);
    expect(resposta.body.nome).to.equal(dados.disciplina.nome);
    //capturando o id da disciplina cadastrada para usar nos próximos testes
    disciplinaId = resposta.body.id;
});
it('Realizar a matrícula do aluno na disciplina', async () => {
    const resposta = await request(app)
        .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            alunoId: alunoId
        });

    expect(resposta.status).to.equal(201);
    expect(resposta.body.alunoId).to.equal(alunoId);
    expect(resposta.body.disciplinaId).to.equal(disciplinaId);
});

it('Realizar o login do aluno cadastrado', async () => {
    alunoToken = await loginComoAluno(aluno.email, aluno.senha);
   //console.log(alunoToken);
});
it('Realizar a entrega do trabalho como aluno', async () => {
    const resposta = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({
            disciplinaId: disciplinaId,
            titulo: dados.trabalho.titulo,
            descricao: dados.trabalho.descricao
        });

    expect(resposta.status).to.equal(201);
    expect(resposta.body.alunoId).to.equal(alunoId);
    expect(resposta.body.disciplinaId).to.equal(disciplinaId);
    expect(resposta.body.titulo).to.equal(dados.trabalho.titulo);
});
});