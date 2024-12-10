const request = require('supertest');
const { app, books, loans } = require('../src/2-books/app');

describe('Testes de integração - API de Livros', () => {
    beforeEach(() => {
        books.length = 0; // Limpa os livros antes de cada teste
        loans.length = 0; // Limpa os empréstimos antes de cada teste
    });

    it('Adição de um novo livro com dados válidos', async () => {
        const newBook = { name: 'Livro A', author: 'Autor A', description: 'Descricao A' };

        const response = await request(app)
            .post('/books')
            .send(newBook)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject(newBook);
        expect(response.body).toHaveProperty('id', 1);
        expect(books).toHaveLength(1);
    });

    it('Validação ao tentar adicionar um livro com dados inválidos', async () => {
        const invalidBook = { author: 'Autor A' };

        const response = await request(app)
            .post('/books')
            .send(invalidBook)
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'necessário nome, autor e descrição' });
        expect(books).toHaveLength(0);
    });

    it('Listagem de todos os livros', async () => {
        books.push({ id: 1, name: 'Livro A', author: 'Autor A', description: 'Descricao A' });

        const response = await request(app)
            .get('/books')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({ name: 'Livro A', author: 'Autor A' });
    });

    it('Atualização das informações de um livro existente', async () => {
        books.push({ id: 1, name: 'Livro A', author: 'Autor A', description: 'Descricao A' });

        const updatedData = { name: 'Livro Atualizado' };

        const response = await request(app)
            .put('/books/1')
            .send(updatedData)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject({ id: 1, name: 'Livro Atualizado', author: 'Autor A' });
    });

    it('Remoção de um livro e confirmação de que ele não existe mais', async () => {
        books.push({ id: 1, name: 'Livro A', author: 'Autor A', description: 'Descricao A' });

        await request(app)
            .delete('/books/1')
            .expect(204);

        expect(books).toHaveLength(0);
    });

    it('Realização de um empréstimo, garantindo que o livro não esteja disponível para outro empréstimo', async () => {
        books.push({ id: 1, name: 'Livro A', author: 'Autor A', description: 'Descricao A' });

        const loanData = { bookId: 1, userId: 1 };

        const response = await request(app)
            .post('/loans')
            .send(loanData)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Loan registered' });
        expect(loans).toHaveLength(1);

        const secondLoanResponse = await request(app)
            .post('/loans')
            .send(loanData)
            .expect(400)
            .expect('Content-Type', /json/);

        expect(secondLoanResponse.body).toEqual({ error: 'Book is already loaned' });
    });

    it('Realização da devolução de um livro, tornando-o disponível novamente', async () => {
        loans.push({ bookId: 1, userId: 1, loanDate: new Date() });

        const returnData = { bookId: 1, userId: 1 };

        const response = await request(app)
            .post('/returns')
            .send(returnData)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ message: 'Book returned successfully' });
        expect(loans).toHaveLength(0);
    });

    it('Comportamento ao tentar emprestar um livro indisponível ou inexistente', async () => {
        const loanData = { bookId: 999, userId: 1 };

        const response = await request(app)
            .post('/loans')
            .send(loanData)
            .expect(404)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'Book not found' });
    });
});
