const fetchStarredBooks = async () => {
  const response = await fetch("/user/starred-books");
  const data = await response.json();

  const starredBooks = document.getElementById("starred-books");
  data.forEach((book) => {
    const bookElement = renderBook(book);
    starredBooks.appendChild(bookElement);
  });
};

fetchStarredBooks();
