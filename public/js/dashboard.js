document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadDashboardData();

  // Add event listeners for filters
  const dateFilter = document.querySelector('button.filter-button:nth-child(1)');
  const authorFilter = document.querySelector('button.filter-button:nth-child(2)');
  const genreFilter = document.querySelector('button.filter-button:nth-child(3)');

  dateFilter?.addEventListener('click', () => toggleFilter('date'));
  authorFilter?.addEventListener('click', () => toggleFilter('author'));
  genreFilter?.addEventListener('click', () => toggleFilter('genre'));

  // Search functionality
  const searchInput = document.querySelector('.search-bar input');
  let searchTimeout;

  searchInput?.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchBooks(this.value);
    }, 300);
  });

  // Handle book actions
  document.addEventListener('click', function(e) {
    if (e.target.closest('.action-button')) {
      const button = e.target.closest('.action-button');
      const isHeart = button.querySelector('.fa-heart');
      const isStar = button.querySelector('.fa-star');
      
      if (isHeart) {
        toggleLike(button);
      } else if (isStar) {
        toggleStar(button);
      }
    }
  });
});

async function loadDashboardData() {
  try {
    const response = await fetch('/api/dashboard/stats');
    const data = await response.json();

    if (response.ok) {
      updateDashboardStats(data);
      updateNewReads(data.newReads);
      updatePickOfTheWeek(data.pickOfTheWeek);
    } else {
      console.error('Failed to load dashboard data:', data.error);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function updateDashboardStats(data) {
  // Update stats cards
  document.querySelector('.recently-borrowed .stat-count').textContent = `${data.recentlyBorrowed} Books`;
  document.querySelector('.currently-reading .stat-count').textContent = `${data.currentlyReading} Books`;
  document.querySelector('.pending-returns .stat-count').textContent = `${data.pendingReturns} Books`;
}

function updateNewReads(books) {
  const container = document.querySelector('.books-grid');
  if (!container || !books) return;

  container.innerHTML = books.map(book => `
    <div class="book-card">
      <img class="book-image" src="${book.image}" alt="${book.title}">
      <div class="book-info">
        <span class="book-status status-available">Available</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <p class="book-description">${book.description}</p>
        <div class="book-actions">
          <button class="action-button">
            <i class="far fa-heart"></i>
          </button>
          <button class="action-button">
            <i class="far fa-star"></i>
          </button>
        </div>
        <div class="book-buttons">
          <button class="btn btn-primary">Borrow</button>
          <button class="btn btn-secondary">Buy now</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updatePickOfTheWeek(books) {
  const container = document.querySelector('.picks-grid');
  if (!container || !books) return;

  container.innerHTML = books.map(book => `
    <div class="pick-card">
      <img class="pick-image" src="${book.image}" alt="${book.title}">
      <div class="pick-info">
        <h3 class="pick-title">${book.title}</h3>
        <p class="pick-author">${book.author}</p>
        <button class="btn btn-primary w-full">Borrow now</button>
      </div>
    </div>
  `).join('');
}

function toggleFilter(type) {
  // Implementation for filter toggles
  console.log(`Toggle ${type} filter`);
}

async function searchBooks(query) {
  if (!query) {
    loadDashboardData();
    return;
  }

  try {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (response.ok) {
      updateNewReads(data.books);
    } else {
      console.error('Search failed:', data.error);
    }
  } catch (error) {
    console.error('Error searching books:', error);
  }
}

async function toggleLike(button) {
  const icon = button.querySelector('i');
  icon.classList.toggle('fas');
  icon.classList.toggle('far');
  // Add API call to toggle like status
}

async function toggleStar(button) {
  const icon = button.querySelector('i');
  icon.classList.toggle('fas');
  icon.classList.toggle('far');
  // Add API call to toggle star status
} 