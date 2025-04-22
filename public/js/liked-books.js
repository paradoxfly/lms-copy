const fetchLikedBooks = async () => {
  const response = await fetch("/user/liked-books");
  const data = await response.json();

  const likedBooks = document.getElementById("liked-books");
  data.forEach((book) => {
    const bookElement = renderBook(book);
    likedBooks.appendChild(bookElement);
  });
};

fetchLikedBooks();
