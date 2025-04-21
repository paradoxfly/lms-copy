const fetchAllBooks = async () => {
  const response = await fetch("/books");
  const data = await response.json();

  const newReads = document.getElementById("new-reads");
  data.forEach((book) => {
    const bookElement = renderBook(book);
    newReads.appendChild(bookElement);
  });
};

fetchAllBooks();

const renderBook = (book) => {
  const bookElement = document.createElement("div");
  bookElement.className =
    "book-card bg-white border rounded-xl overflow-hidden";

  bookElement.innerHTML = `
        <div class="p-4 flex gap-4">
          <div class="flex-shrink-0">
            <img class="book-cover" src="${book.image}" alt="${book.title}" />
          </div>
          <div class="flex flex-col">
            <span class="available-badge">Available</span>
            <h3 class="text-sm font-semibold mb-1">${book.title}</h3>
            <p class="text-xs text-gray-500 mb-2">${book.author}</p>
            <p class="text-xs text-gray-500 mb-1">
              ${book.description.slice(0, 100)}...
              <span class="read-more"> Read more...</span>
            </p>
            <div class="flex items-center gap-2 mt-auto">
              <button class="action-button">
                <i class="far fa-heart"></i>
              </button>
              <button class="action-button">
                <i class="far fa-star"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="p-4 pt-0 flex gap-2">
          <button class="borrow-button flex-1 py-1 text-sm">Borrow</button>
          <button class="buy-button flex-1">Buy now</button>
        </div>
    `;

  return bookElement;
};
