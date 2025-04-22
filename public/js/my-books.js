const fetchMyBooks = async () => {
    const response = await fetch("/user/borrowed-books");
    const data = await response.json();
  
    const myBooks = document.getElementById("my-books");
    data.forEach((book) => {
      const bookElement = renderBook(book);
      myBooks.appendChild(bookElement);
    });
  };
  
  fetchMyBooks();
  