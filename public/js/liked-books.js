const fetchLikedBooks = async () => {
  const response = await fetch("/user/liked-books");
  const data = await response.json();

  const likedBooks = document.getElementById("liked-books");
  data.forEach((book) => {
    const bookElement = renderBook(book);
    likedBooks.appendChild(bookElement);
  });
};

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
    window.location.href = `/user/search-results?context=liked&${params.toString()}`;
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
      window.location.href = `/user/search-results?context=liked&${params.toString()}`;
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
    const likedBooksContainer = document.getElementById("liked-books");
    likedBooksContainer.innerHTML = '<div class="col-span-3 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';

    // Fetch results from liked books endpoint
    const response = await fetch(`/user/liked-books?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const books = await response.json();
    
    // Update UI with results
    if (!Array.isArray(books) || books.length === 0) {
      likedBooksContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">No books found matching your search criteria</p>';
      return;
    }

    // Clear and render results
    likedBooksContainer.innerHTML = '';
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
      likedBooksContainer.insertAdjacentHTML('beforeend', bookCard);
    });
  } catch (error) {
    console.error('Error performing search:', error);
    const likedBooksContainer = document.getElementById("liked-books");
    likedBooksContainer.innerHTML = '<p class="text-center text-red-500 col-span-3">Error performing search. Please try again.</p>';
  }
};

// Initialize dashboard
console.log('Initializing dashboard...');
fetchLikedBooks();
initializeSearchAndFilters();
