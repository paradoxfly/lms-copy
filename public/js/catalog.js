document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const genreFilter = document.getElementById('genre-filter');
  const sortBy = document.getElementById('sort-by');
  const clearFilters = document.getElementById('clear-filters');
  const booksContainer = document.getElementById('books-container');
  const noResults = document.getElementById('no-results');

  let currentPage = 1;
  let debounceTimer;

  // Load initial books and genres
  loadBooks();
  loadGenres();

  // Event listeners
  searchInput.addEventListener('input', debounceSearch);
  searchBtn.addEventListener('click', () => loadBooks());
  genreFilter.addEventListener('change', () => {
    currentPage = 1;
    loadBooks();
  });
  sortBy.addEventListener('change', () => {
    currentPage = 1;
    loadBooks();
  });
  clearFilters.addEventListener('click', clearAllFilters);

  function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      loadBooks();
    }, 300);
  }

  async function loadBooks() {
    try {
      const searchTerm = searchInput.value.trim();
      const genre = genreFilter.value;
      const sort = sortBy.value;

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      if (genre) queryParams.append('genre', genre);
      if (sort) queryParams.append('sortBy', sort);

      const response = await fetch(`/api/books?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch books');
      }

      displayBooks(data.books);
      updatePagination(data.pagination);
      
      // Show/hide no results message
      noResults.style.display = data.books.length === 0 ? 'block' : 'none';
      booksContainer.style.display = data.books.length === 0 ? 'none' : 'grid';

    } catch (error) {
      console.error('Error loading books:', error);
      showError('Failed to load books. Please try again.');
    }
  }

  async function loadGenres() {
    try {
      const response = await fetch('/api/books/genres');
      const genres = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }

      // Clear existing options except "All Genres"
      while (genreFilter.options.length > 1) {
        genreFilter.remove(1);
      }

      // Add new genre options
      genres.forEach(genre => {
        const option = new Option(genre, genre);
        genreFilter.add(option);
      });

    } catch (error) {
      console.error('Error loading genres:', error);
    }
  }

  function displayBooks(books) {
    booksContainer.innerHTML = books.map(book => `
      <div class="book-card">
        <img class="book-image" src="data:image/jpeg;base64,${book.image}" alt="${book.title}">
        <div class="book-info">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">by ${book.author}</p>
          <span class="book-genre">${book.genre}</span>
        </div>
      </div>
    `).join('');
  }

  function updatePagination(pagination) {
    // Implementation for pagination UI if needed
  }

  function clearAllFilters() {
    searchInput.value = '';
    genreFilter.value = '';
    sortBy.value = 'title';
    currentPage = 1;
    loadBooks();
  }

  function showError(message) {
    // Implementation for error display
    console.error(message);
  }
}); 