const fetchMyBooks = async () => {
    const response = await fetch("/user/borrowed-books");
    const data = await response.json();
  
    // Split books
    const readingNow = data.filter(
      (book) => book.transactionType === 'RENTAL' && book.status === 'ACTIVE'
    );
    const boughtBooks = data.filter(
      (book) => book.transactionType === 'PURCHASE'
    );
    const borrowedBooks = data.filter(
      (book) => book.transactionType === 'RENTAL'
    );
  
    // Render Reading now
    const readingNowContainer = document.getElementById('reading-now-books');
    readingNowContainer.innerHTML = '';
    readingNow.forEach((book) => {
      readingNowContainer.appendChild(renderBookCard(book, 'RENTAL'));
    });
  
    // Render My Bought books
    const boughtBooksContainer = document.getElementById('bought-books');
    boughtBooksContainer.innerHTML = '';
    boughtBooks.forEach((book) => {
      boughtBooksContainer.appendChild(renderBookCard(book, 'PURCHASE'));
    });
  
    // Render My Borrowed books table
    const borrowedBooksTable = document.getElementById('borrowed-books-table');
    borrowedBooksTable.innerHTML = '';
    borrowedBooks.forEach((book, idx) => {
      const parseDate = (d) => d ? new Date(d.replace(' ', 'T')) : null;
      const isOverdue = book.status === 'OVERDUE' && book.dueDate;
      let overdueText = '';
      if (isOverdue) {
        const dueDateObj = parseDate(book.dueDate);
        const daysLate = dueDateObj ? Math.ceil((Date.now() - dueDateObj) / (1000 * 60 * 60 * 24)) : 0;
        overdueText = `<span class='text-xs text-red-600' title='Overdue by ${daysLate} day(s)'> (Overdue by ${daysLate} day${daysLate !== 1 ? 's' : ''})</span>`;
      }
      const borrowedDateObj = parseDate(book.borrowedOn);
      const dueDateObj = parseDate(book.dueDate);
      const canReturn = ['ACTIVE', 'OVERDUE'].includes(book.status);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${idx + 1}</td>
        <td class="px-4 py-2">${book.title}</td>
        <td class="px-4 py-2">${borrowedDateObj ? borrowedDateObj.toLocaleDateString() : '-'}</td>
        <td class="px-4 py-2">${dueDateObj ? dueDateObj.toLocaleDateString() : '-'}${overdueText}</td>
        <td class="px-4 py-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(book.status)}">${book.status}</span>
        </td>
        <td class="px-4 py-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${typeBadgeClass(book.transactionType)}">${book.transactionType === 'RENTAL' ? 'Borrowed' : 'Purchased'}</span>
        </td>
        <td class="px-4 py-2">
          ${canReturn ? `<button class='return-btn px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition' data-book-id='${book.book_id}'>Return</button>` : ''}
        </td>
      `;
      borrowedBooksTable.appendChild(tr);
    });
    // Add event listeners for return buttons
    borrowedBooksTable.querySelectorAll('.return-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookId = btn.getAttribute('data-book-id');
        if (!confirm('Are you sure you want to return this book?')) return;
        try {
          const response = await fetch(`/user/books/${bookId}/return`, { method: 'POST' });
          const result = await response.json();
          if (response.ok) {
            showToast(result.message || 'Book returned successfully');
            fetchMyBooks();
          } else {
            showToast(result.error || 'Failed to return book', 'error');
          }
        } catch (error) {
          showToast(error.message || 'Failed to return book', 'error');
        }
      });
    });
  };
  
  function renderBookCard(book, type) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-4 flex flex-col';
    card.innerHTML = `
      <img class="w-full h-48 object-cover rounded-md mb-3" src="${book.image || '/images/default-book-cover.jpg'}" alt="${book.title}">
      <h3 class="text-base font-semibold mb-1">${book.title}</h3>
      <p class="text-xs text-gray-500 mb-1">${book.author}</p>
      <p class="text-xs text-gray-500 mb-2">${book.description ? book.description.slice(0, 60) + '...' : ''}</p>
      <div class="flex items-center gap-2 mt-auto">
        <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${typeBadgeClass(type)}">${type === 'RENTAL' ? 'Borrowed' : 'Purchased'}</span>
        <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(book.status)}">${book.status}</span>
      </div>
    `;
    return card;
  }
  
  function statusBadgeClass(status) {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function typeBadgeClass(type) {
    return type === 'PURCHASE' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800';
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
  fetchMyBooks();
  initializeSearchAndFilters();
  