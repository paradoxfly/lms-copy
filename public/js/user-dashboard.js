const fetchAllBooks = async () => {
  const response = await fetch("/books");
  const data = await response.json();

  const newReads = document.getElementById("new-reads");
  data.forEach((book) => {
    const bookElement = renderBook(book);
    newReads.appendChild(bookElement);
  });
};

const fetchRecentlyBorrowedBooks = async () => {
  const response = await fetch("/user/borrowed-books");
  const data = await response.json();

  const recentlyBorrowedBooks = document.getElementById("recently-borrowed-books");
  recentlyBorrowedBooks.innerHTML = `${data.length} Book${data.length > 1 ? "s" : ""}`;
}


fetchAllBooks();
fetchRecentlyBorrowedBooks();
