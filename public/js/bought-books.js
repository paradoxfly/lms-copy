document.addEventListener('DOMContentLoaded', () => {
  const booksContainer = document.getElementById('bought-books-list');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const filterButtons = document.querySelectorAll('.filter-button');
  let currentFilter = null;

  // Initialize
  fetchBoughtBooks();

  // Event Listeners
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      if (currentFilter === filter) {
        currentFilter = null;
        button.classList.remove('active');
      } else {
        currentFilter = filter;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }
      performSearch();
    });
  });

  async function fetchBoughtBooks() {
    try {
      const response = await fetch('/user/books/bought');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bought books');
      }

      booksContainer.innerHTML = '';
      data.forEach(book => {
        booksContainer.appendChild(renderBookCard(book));
      });
    } catch (error) {
      console.error('Error fetching bought books:', error);
      booksContainer.innerHTML = '<p class="text-center text-red-500">Error loading bought books. Please try again.</p>';
    }
  }

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query && !currentFilter) {
      fetchBoughtBooks();
      return;
    }

    try {
      const response = await fetch(`/user/books/bought/search?query=${encodeURIComponent(query)}&filter=${currentFilter || ''}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      booksContainer.innerHTML = '';
      if (data.length === 0) {
        booksContainer.innerHTML = '<p class="text-center text-gray-500">No books found matching your search</p>';
        return;
      }

      data.forEach(book => {
        booksContainer.appendChild(renderBookCard(book));
      });
    } catch (error) {
      console.error('Error performing search:', error);
      booksContainer.innerHTML = '<p class="text-center text-red-500">Error performing search. Please try again.</p>';
    }
  }
}); 