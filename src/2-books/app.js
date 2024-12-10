const express = require('express');
const app = express();

app.use(express.json());

let books = [];
let loans = [];


app.post('/books',(req,res)=>{
    const book = req.body;
    if(!book.name||!book.author||!book.description){
        return res.status(400).json({error: 'necessário nome, autor e descrição'})
    }
    book.id=books.length + 1;
    books.push(book);
    res.status(201).json(book);
})


app.get('/books', (req, res) => {
    res.json(books);
});


app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex(b => b.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books[bookIndex] = { ...books[bookIndex], ...req.body };
    res.json(books[bookIndex]);
});


app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex(b => b.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(bookIndex, 1);
    res.status(204).send();
});


app.post('/loans', (req, res) => {
    const { bookId, userId } = req.body;

    if (!bookId || !userId) {
        return res.status(400).json({ error: 'Book ID and User ID are required' });
    }

    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (loans.find(l => l.bookId === bookId)) {
        return res.status(400).json({ error: 'Book is already loaned' });
    }

    loans.push({ bookId, userId, loanDate: new Date() });
    res.status(201).json({ message: 'Loan registered' });
});


app.post('/returns', (req, res) => {
    const { bookId, userId } = req.body;

    const loanIndex = loans.findIndex(l => l.bookId === bookId && l.userId === userId);

    if (loanIndex === -1) {
        return res.status(404).json({ error: 'Loan not found' });
    }

    loans.splice(loanIndex, 1);
    res.json({ message: 'Book returned successfully' });
});

module.exports = { app, books, loans };
