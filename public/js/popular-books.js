document.addEventListener('DOMContentLoaded', () => {
  const booksContainer = document.getElementById('popular-books-list');
  const paginationControls = document.getElementById('pagination-controls');
  let currentPage = 1;
  const pageSize = 12;

  async function fetchPopularBooks(page = 1) {
    booksContainer.innerHTML = '<div class="col-span-3 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
    try {
      const response = await fetch(`/user/popular-books?page=${page}&limit=${pageSize}`);
      const data = await response.json();
      const books = data.books || [];
      booksContainer.innerHTML = '';
      if (!Array.isArray(books) || books.length === 0) {
        booksContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">No popular books found</p>';
        paginationControls.innerHTML = '';
        return;
      }
      books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card bg-white border rounded-xl overflow-hidden cursor-pointer relative';
        bookCard.onclick = () => { window.location.href = `/user/books/${book.book_id}`; };
        bookCard.innerHTML = `
          <div class="p-4 flex gap-4">
            <div class="flex-shrink-0">
              <img class="book-cover" src="${book.image || '/images/default-book-cover.jpg'}" alt="${book.title}" onerror="this.src='/images/default-book-cover.jpg'">
            </div>
            <div class="flex flex-col flex-1">
              <span class="available-badge">${book.no_of_copies_available > 0 ? 'Available' : 'Not Available'}</span>
              <h3 class="text-sm font-semibold mb-1">${book.title}</h3>
              <p class="text-xs text-gray-500 mb-2">${book.author}</p>
              <p class="text-xs text-gray-500 mb-1">
                ${book.description ? book.description.substring(0, 100) + '...' : 'No description available'}
                <span class="read-more">Read more...</span>
              </p>
              <div class="flex items-center gap-2 mt-auto">
                <button class="action-button star-btn" title="Star" onclick="event.stopPropagation(); toggleStar(${book.book_id})">
                  <i class="fas fa-star text-yellow-500"></i> <span>${book.starCount}</span>
                </button>
                <button class="action-button like-btn" title="Like" onclick="event.stopPropagation(); toggleLike(${book.book_id})">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 pt-0 flex gap-2">
            <button class="borrow-button flex-1 py-1 text-sm ${book.no_of_copies_available === 0 ? 'disabled' : ''}" onclick="event.stopPropagation(); borrowBook(${book.book_id}, ${book.rental_price})" ${book.no_of_copies_available === 0 ? 'disabled' : ''}>
              Borrow
            </button>
            <button class="buy-button flex-1" onclick="event.stopPropagation(); buyBook(${book.book_id}, '${book.title}')">Buy now</button>
          </div>
        `;
        booksContainer.appendChild(bookCard);
      });
      renderPagination(data.page, Math.ceil(data.total / data.pageSize));
    } catch (error) {
      booksContainer.innerHTML = '<p class="text-center text-red-500 col-span-3">Error loading popular books. Please try again.</p>';
      paginationControls.innerHTML = '';
    }
  }

  function renderPagination(current, totalPages) {
    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `mx-1 px-3 py-1 rounded ${i === current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        fetchPopularBooks(currentPage);
      };
      paginationControls.appendChild(btn);
    }
  }

  // Expose logic for like/star/borrow/buy
  window.toggleLike = async (bookId) => {
    // You can reuse your global logic or implement here
    // ...
  };
  window.toggleStar = async (bookId) => {
    // ...
  };
  window.borrowBook = async (bookId, rentalPrice = 0) => {
    const modalResult = await window.showBorrowModal({ dailyPrice: rentalPrice, maxDuration: 30 });
    if (!modalResult) return;
    try {
      const response = await fetch(`/user/books/${bookId}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalResult)
      });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Book borrowed successfully');
        fetchPopularBooks(currentPage);
      } else {
        showToast(data.error || 'Failed to borrow book', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to borrow book', 'error');
    }
  };
  window.buyBook = async (bookId, bookTitle) => {
    // ...
  };

  fetchPopularBooks(currentPage);
}); 