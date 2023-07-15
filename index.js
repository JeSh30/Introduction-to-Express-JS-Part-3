const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); // middle ware function must to write to create or update the details
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

// Connecting sqlite Database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBook = `SELECT * FROM book WHERE book_id = ${bookId};`;
  const book = await db.get(getBook);
  response.send(book);
});

// Creating a book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBook = `
  INSERT INTO 
  book (title, author_id, rating, rating_count, review_count, description, pages, date_of_publication, edition_language, price, online_stores)
  VALUES ("${title}",
    ${authorId},
    ${rating},
    ${ratingCount},
    ${reviewCount},
    "${description}",
    ${pages},
    "${dateOfPublication}",
    "${editionLanguage}",
    ${price},
    "${onlineStores}"
    );`;
  const dbResponse = await db.run(addBook);
  const bookId = dbResponse.lastID;
  response.send({ bookID: bookId });
});

// Update Book API
app.put("/books/:bookID/", async (request, response) => {
  const { bookID } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const upDateBook = `
    UPDATE 
        book 
    SET 
        title = "${title}", 
        author_id = ${authorId}, 
        rating = ${rating}, 
        rating_count = ${ratingCount},
        review_count = ${reviewCount},
        description = "${description}", 
        pages = ${pages},
        date_of_publication = "${dateOfPublication}",
        edition_language = "${editionLanguage}",
        price = ${price},
        online_stores = "${onlineStores}"
    WHERE 
        book_id = ${bookID};`;
  await db.run(upDateBook);
  response.send("Book Updated Successfully.");
});

// Delete book API
app.delete("/books/:bookID/", async (request, response) => {
  const { bookID } = request.params;
  const deleteBook = `
        DELETE 
        FROM book
        WHERE 
            book_id = ${bookID};`;
  await db.run(deleteBook);
  response.send("Book Deleted Successfully.");
});

// Get Particular Author books list
app.get("/authors/:authorID/books/", async (request, response) => {
  const { authorID } = request.params;
  const authorBooks = `
    SELECT *
    FROM book
    WHERE author_id = ${authorID};`;
  const booksList = await db.all(authorBooks);
  response.send(booksList);
});
