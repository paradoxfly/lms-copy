document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('search-results-container');
  const searchInput = document.getElementById('searchInput');

  // Parse query, filters, and context from URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = searchInput ? searchInput.value.trim() : (urlParams.get('query') || '');
  const filters = urlParams.getAll('filter');
  const context = urlParams.get('context') || 'all';

  // Build API params
  const apiParams = new URLSearchParams();
  if (query) apiParams.append('query', query);
  filters.forEach(f => apiParams.append('filter', f));

  // Determine endpoint based on context
  let endpoint;
  switch (context) {
    case 'liked':
      endpoint = '/user/liked-books';
      break;
    case 'starred':
      endpoint = '/user/starred-books';
      break;
    case 'borrowed':
      endpoint = '/user/my-books'; // Adjust if you have a different endpoint
      break;
    default:
      endpoint = '/user/books/search';
  }

  // Fetch and render results
  async function fetchResults() {
    container.innerHTML = '<div class="col-span-3 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
    try {
      const response = await fetch(`${endpoint}?${apiParams.toString()}`, { cache: 'no-store' });
      if (response.status === 401 || response.status === 403) {
        container.innerHTML = '<p class="text-center text-red-500 col-span-3">You must be logged in to search for books.</p>';
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch search results');
      const books = await response.json();
      if (!Array.isArray(books) || books.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-3">No books found matching your search criteria</p>';
        return;
      }
      container.innerHTML = '';
      books.forEach(book => {
        const bookCard = `
          <div class="book-card bg-white border rounded-xl overflow-hidden cursor-pointer" onclick="window.location.href='/user/books/${book.book_id}'">
            <div class="p-4 flex gap-4">
              <div class="flex-shrink-0">
                <img class="book-cover" src="${book.image || '/images/default-book-cover.jpg'}" alt="${book.title}" onerror="this.src='/images/default-book-cover.jpg'">
              </div>
              <div class="flex flex-col">
                <span class="${book.no_of_copies_available > 0 ? 'available-badge' : 'unavailable-badge'}">${book.no_of_copies_available > 0 ? 'Available' : 'Not Available'}</span>
                <h3 class="text-sm font-semibold mb-1">${book.title}</h3>
                <p class="text-xs text-gray-500 mb-2">${book.author}</p>
                <p class="text-xs text-gray-500 mb-1">
                  ${book.description ? book.description.substring(0, 100) + '...' : 'No description available'}
                  <span class="read-more">Read more...</span>
                </p>
                <div class="flex items-center gap-2 mt-auto">
                  <button class="action-button" onclick="event.stopPropagation(); toggleLike(${book.book_id})">
                    <i class="fa${book.isLiked ? 's' : 'r'} fa-heart"></i>
                  </button>
                  <button class="action-button" onclick="event.stopPropagation(); toggleStar(${book.book_id})">
                    <i class="fa${book.isStarred ? 's' : 'r'} fa-star"></i>
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
          </div>
        `;
        container.insertAdjacentHTML('beforeend', bookCard);
      });
    } catch (error) {
      container.innerHTML = '<p class="text-center text-red-500 col-span-3">Error loading search results. Please try again.</p>';
    }
  }

  fetchResults();
});

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
      fetchResults();
    } else {
      showToast(data.error || 'Failed to borrow book', 'error');
    }
  } catch (error) {
    showToast(error.message || 'Failed to borrow book', 'error');
  }
};

// Reuse like/star/borrow/buy logic if needed (import or duplicate as needed) 