const fetchNewReads = async () => {
  try {
    console.log('Fetching new reads...');
    const response = await fetch("/user/books/new-reads");
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const books = await response.json();
    console.log('Books received:', books);

    const newReadsContainer = document.getElementById("new-reads");
    if (!newReadsContainer) {
      console.error('Could not find new-reads container');
      return;
    }
    console.log('Found new-reads container');
    
    if (!Array.isArray(books) || books.length === 0) {
      console.log('No books available');
      newReadsContainer.innerHTML = '<p class="text-center text-gray-500">No new books available</p>';
      return;
    }
    
    newReadsContainer.innerHTML = ''; // Clear existing content

    books.forEach(book => {
      console.log('Rendering book:', book);
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
            <button class="borrow-button flex-1 py-1 text-sm ${book.no_of_copies_available === 0 ? 'disabled' : ''}" onclick="event.stopPropagation(); borrowBook(${book.book_id})" ${book.no_of_copies_available === 0 ? 'disabled' : ''}>
              Borrow
            </button>
            <button class="buy-button flex-1" onclick="event.stopPropagation(); buyBook(${book.book_id}, '${book.title}')">Buy now</button>
          </div>
        </div>
      `;
      newReadsContainer.insertAdjacentHTML('beforeend', bookCard);
    });
  } catch (error) {
    console.error('Error fetching new reads:', error);
    const newReadsContainer = document.getElementById("new-reads");
    if (newReadsContainer) {
      newReadsContainer.innerHTML = '<p class="text-center text-red-500">Error loading books. Please try again later.</p>';
    }
  }
};

const fetchRecentlyBorrowedBooks = async () => {
  try {
    console.log('Fetching borrowed books...');
    const response = await fetch("/user/borrowed-books");
    console.log('Borrowed books response:', response);
    const data = await response.json();
    console.log('Borrowed books:', data);

    const recentlyBorrowedBooks = document.getElementById("recently-borrowed-books");
    if (!recentlyBorrowedBooks) {
      console.error('Could not find recently-borrowed-books element');
      return;
    }
    recentlyBorrowedBooks.textContent = `${data.length} Book${data.length !== 1 ? "s" : ""}`;
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
  }
};

const toggleLike = async (bookId) => {
  try {
    console.log('Toggling like for book:', bookId);
    const response = await fetch(`/user/books/${bookId}/like`, {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      fetchNewReads(); // Refresh the books display
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};

const toggleStar = async (bookId) => {
  try {
    console.log('Toggling star for book:', bookId);
    const response = await fetch(`/user/books/${bookId}/star`, {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      fetchNewReads(); // Refresh the books display
    }
  } catch (error) {
    console.error('Error toggling star:', error);
  }
};

const borrowBook = async (bookId) => {
  try {
    console.log('Borrowing book:', bookId);
    const response = await fetch(`/user/books/${bookId}/borrow`, {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      fetchNewReads(); // Refresh the books display
      fetchRecentlyBorrowedBooks(); // Update borrowed books count
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
  }
};

async function buyBook(bookId, bookTitle) {
  // Show confirmation modal
  const modal = document.getElementById('buyConfirmationModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Update confirmation message with book title
  const confirmMessage = modal.querySelector('p');
  confirmMessage.textContent = `Are you sure you want to purchase "${bookTitle}"?`;
  
  // Set up modal buttons
  const cancelBtn = document.getElementById('cancelBuyBtn');
  const confirmBtn = document.getElementById('confirmBuyBtn');
  
  // Handle cancel
  cancelBtn.onclick = () => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  };
  
  // Handle confirm
  confirmBtn.onclick = async () => {
    try {
      const response = await fetch(`/user/books/${bookId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (response.ok) {
        showToast(result.message || 'Book purchased successfully');
        // Close modal
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        // Refresh the books display
        fetchNewReads();
      } else {
        throw new Error(result.error || 'Failed to purchase book');
      }
    } catch (error) {
      console.error('Error buying book:', error);
      showToast(error.message || 'Failed to buy book', 'error');
      // Close modal on error
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
  };
}

// Search and filter state
let searchState = {
  query: '',
  filters: {
    date: null,
    author: null,
    genre: null
  }
};

// Initialize search and filter functionality
const initializeSearchAndFilters = () => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const filterButtons = document.querySelectorAll('.filter-button');

  // Handle search input
  searchInput.addEventListener('input', (e) => {
    searchState.query = e.target.value;
  });

  // Handle search button click
  searchButton.addEventListener('click', () => {
    // Always get the latest value from the input
    const query = searchInput.value.trim();
    const params = new URLSearchParams();
    if (query) {
      params.append('query', query);
    }
    Object.entries(searchState.filters).forEach(([key, value]) => {
      if (value) {
        params.append('filter', key);
      }
    });
    window.location.href = `/user/search-results?${params.toString()}`;
  });

  // Handle Enter key in search input
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      const params = new URLSearchParams();
      if (query) {
        params.append('query', query);
      }
      Object.entries(searchState.filters).forEach(([key, value]) => {
        if (value) {
          params.append('filter', key);
        }
      });
      window.location.href = `/user/search-results?${params.toString()}`;
    }
  });

  // Handle filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.dataset.filter;
      toggleFilter(button, filterType);
    });
  });
};

// Toggle filter state and UI
const toggleFilter = (button, filterType) => {
  const isActive = button.classList.contains('active');
  
  // Reset all filters of the same type
  document.querySelectorAll(`.filter-button[data-filter="${filterType}"]`).forEach(btn => {
    btn.classList.remove('active');
  });

  if (!isActive) {
    button.classList.add('active');
    searchState.filters[filterType] = true;
  } else {
    searchState.filters[filterType] = null;
  }

  // Perform search with updated filters
  performSearch();
};

// Perform search with current state
const performSearch = async () => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (searchState.query) {
      params.append('query', searchState.query);
    }
    
    // Add active filters
    Object.entries(searchState.filters).forEach(([key, value]) => {
      if (value) {
        params.append('filter', key);
      }
    });

    // Show loading state
    const newReadsContainer = document.getElementById("new-reads");
    newReadsContainer.innerHTML = '<div class="col-span-3 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';

    // Fetch results
    const response = await fetch(`/user/books/search?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const books = await response.json();
    
    // Update UI with results
    if (!Array.isArray(books) || books.length === 0) {
      newReadsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">No books found matching your search criteria</p>';
      return;
    }

    // Clear and render results
    newReadsContainer.innerHTML = '';
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
            <button class="borrow-button flex-1 py-1 text-sm ${book.no_of_copies_available === 0 ? 'disabled' : ''}" onclick="event.stopPropagation(); borrowBook(${book.book_id})" ${book.no_of_copies_available === 0 ? 'disabled' : ''}>
              Borrow
            </button>
            <button class="buy-button flex-1" onclick="event.stopPropagation(); buyBook(${book.book_id}, '${book.title}')">Buy now</button>
          </div>
        </div>
      `;
      newReadsContainer.insertAdjacentHTML('beforeend', bookCard);
    });
  } catch (error) {
    console.error('Error performing search:', error);
    const newReadsContainer = document.getElementById("new-reads");
    newReadsContainer.innerHTML = '<p class="text-center text-red-500 col-span-3">Error performing search. Please try again.</p>';
  }
};

// Initialize dashboard
console.log('Initializing dashboard...');
fetchNewReads();
fetchRecentlyBorrowedBooks();
initializeSearchAndFilters();
