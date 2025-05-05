let bookData = null;

async function fetchBookDetails() {
  const loadingStates = {
    start() {
      const bookDetails = document.getElementById('bookDetails');
      if (bookDetails) {
        bookDetails.classList.add('opacity-50', 'relative');
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'absolute inset-0 flex items-center justify-center';
        spinner.innerHTML = `
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        `;
        bookDetails.appendChild(spinner);
      }
    },
    end() {
      const bookDetails = document.getElementById('bookDetails');
      if (bookDetails) {
        bookDetails.classList.remove('opacity-50', 'relative');
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.remove();
      }
    }
  };

  try {
    loadingStates.start();
    const bookId = window.location.pathname.split('/').pop();
    console.log('Fetching book details for ID:', bookId);
    
    const response = await fetch(`/user/api/books/${bookId}`);
    console.log('API Response object:', response);
    const responseText = await response.clone().text();
    console.log('Raw API response text:', responseText);
    let bookDataJson = null;
    try {
      bookDataJson = JSON.parse(responseText);
    } catch (jsonErr) {
      console.error('Failed to parse JSON:', jsonErr);
    }
    console.log('Parsed JSON:', bookDataJson);
    
    if (!response.ok) {
      const errorData = bookDataJson || { error: 'Unknown error' };
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch book details');
    }
    
    bookData = bookDataJson;
    console.log('Book data received:', bookData);
    
    if (!bookData) {
      throw new Error('No book data received');
    }

    // Update UI with book details
    const elements = {
      title: document.getElementById('bookTitle'),
      author: document.getElementById('bookAuthor'),
      aboutAuthor: document.getElementById('aboutAuthor'),
      description: document.getElementById('bookDescription'),
      isbn: document.getElementById('isbn'),
      genre: document.getElementById('genre'),
      publisher: document.getElementById('publisher'),
      year: document.getElementById('year'),
      pages: document.getElementById('pages'),
      totalCopies: document.getElementById('totalCopies'),
      availableCopies: document.getElementById('availableCopies'),
      dailyRentalPrice: document.getElementById('dailyRentalPrice')
    };

    console.log('Found DOM elements:', Object.keys(elements).filter(key => elements[key]));
    console.log('Book data fields:', Object.keys(bookData));

    // Safely update elements
    if (elements.title) elements.title.textContent = bookData.title || 'Untitled';
    if (elements.author) elements.author.textContent = bookData.author || 'Unknown Author';
    if (elements.aboutAuthor) elements.aboutAuthor.textContent = bookData.about_author || 'No author information available';
    if (elements.description) elements.description.textContent = bookData.description || 'No description available';
    if (elements.isbn) elements.isbn.textContent = bookData.isbn || 'N/A';
    if (elements.genre) elements.genre.textContent = bookData.genre || 'N/A';
    if (elements.publisher) elements.publisher.textContent = bookData.publishing_company || 'N/A';
    if (elements.year) elements.year.textContent = bookData.year_of_publication || 'N/A';
    if (elements.pages) elements.pages.textContent = bookData.number_of_pages || 'N/A';
    if (elements.totalCopies) elements.totalCopies.textContent = bookData.no_of_copies || '0';
    if (elements.availableCopies) elements.availableCopies.textContent = bookData.no_of_copies_available || '0';
    if (elements.dailyRentalPrice) elements.dailyRentalPrice.textContent = `$${(bookData.rental_price || 0).toFixed(2)}`;

    // Update book image with fallback
    const bookImage = document.getElementById('bookImage');
    if (bookImage) {
      const defaultImage = '/images/default-book-cover.jpg';
      
      if (bookData.image) {
        bookImage.src = bookData.image;
      } else {
        bookImage.src = defaultImage;
      }
      
      // Add loading state
      bookImage.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      
      // Handle successful load
      bookImage.onload = () => {
        bookImage.classList.remove('opacity-0');
      };
      
      // Handle load error
      bookImage.onerror = () => {
        console.log('Failed to load book image, using default');
        bookImage.src = defaultImage;
        bookImage.classList.remove('opacity-0');
      };
    }

    // Update availability badge
    const availabilityBadge = document.getElementById('availabilityBadge');
    if (availabilityBadge) {
      const isAvailable = bookData.no_of_copies_available > 0;
      availabilityBadge.className = `px-4 py-1 text-sm font-medium rounded-full ${
        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`;
      availabilityBadge.textContent = isAvailable ? 'Available' : 'Not Available';
    }

    // Update like/star buttons
    updateLikeButton(bookData.isLiked);
    updateStarButton(bookData.isStarred);
    
    // Update borrow/return section
    updateBorrowReturnSection(bookData);
    
    // Show Return button if user has an active or overdue borrow
    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
      if (bookData.transaction_status === 'ACTIVE' || bookData.transaction_status === 'OVERDUE') {
        returnBtn.classList.remove('hidden');
        returnBtn.onclick = async () => {
          if (!confirm('Are you sure you want to return this book?')) return;
          try {
            const response = await fetch(`/user/books/${bookData.book_id}/return`, { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
              showToast(result.message || 'Book returned successfully');
              fetchBookDetails();
            } else {
              showToast(result.error || 'Failed to return book', 'error');
            }
          } catch (error) {
            showToast(error.message || 'Failed to return book', 'error');
          }
        };
      } else {
        returnBtn.classList.add('hidden');
      }
    }
    
    // Set up rental duration change handler
    const rentalDuration = document.getElementById('rentalDuration');
    if (rentalDuration) {
      rentalDuration.addEventListener('change', updateRentalPrice);
      updateRentalPrice(); // Initial calculation
    }

    // Show late fee alert if applicable
    const lateFeeAlert = document.getElementById('lateFeeAlert');
    if (lateFeeAlert && bookData.late_fee > 0) {
      lateFeeAlert.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-yellow-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Late Fee: $${bookData.late_fee.toFixed(2)}
            </p>
          </div>
        </div>
      `;
      lateFeeAlert.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching book details:', error);
    showToast(error.message || 'Failed to load book details', 'error');
  } finally {
    loadingStates.end();
  }
}

function updateLikeButton(isLiked) {
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    const icon = likeBtn.querySelector('i');
    if (icon) {
      icon.className = isLiked ? 'fas fa-heart text-xl text-red-500' : 'far fa-heart text-xl';
    }
  }
}

function updateStarButton(isStarred) {
  const starBtn = document.getElementById('starBtn');
  if (starBtn) {
    const icon = starBtn.querySelector('i');
    if (icon) {
      icon.className = isStarred ? 'fas fa-star text-xl text-yellow-500' : 'far fa-star text-xl';
    }
  }
}

function updateRentalPrice() {
  if (!bookData) return;
  
  const duration = parseInt(document.getElementById('rentalDuration').value);
  const dailyPrice = bookData.rental_price || 0;
  const totalPrice = dailyPrice * duration;
  
  const rentalPriceElement = document.getElementById('rentalPrice');
  const totalPriceElement = document.getElementById('totalPrice');
  
  if (rentalPriceElement) {
    rentalPriceElement.textContent = `$${dailyPrice.toFixed(2)}`;
  }
  if (totalPriceElement) {
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
  }
}

function updateBorrowReturnSection(bookData) {
  const borrowSection = document.getElementById('borrowSection');
  if (!borrowSection) return;
  
  if (bookData.userBorrowed) {
    const dueDate = new Date(bookData.rental_end_date);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    const dueDateElement = document.getElementById('dueDate');
    const daysRemainingElement = document.getElementById('daysRemaining');
    
    if (dueDateElement) {
      dueDateElement.textContent = dueDate.toLocaleDateString();
    }
    if (daysRemainingElement) {
      daysRemainingElement.textContent = daysRemaining;
      if (daysRemaining < 0) {
        daysRemainingElement.classList.add('text-red-600');
      }
    }
  }
}

async function toggleLike() {
  if (!bookData) return;
  
  try {
    const response = await fetch(`/books/${bookData.book_id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      bookData.isLiked = !bookData.isLiked;
      updateLikeButton(bookData.isLiked);
      showToast(result.message);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    showToast(error.message || 'Failed to update like status', 'error');
  }
}

async function toggleStar() {
  if (!bookData) return;
  
  try {
    const response = await fetch(`/books/${bookData.book_id}/star`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      bookData.isStarred = !bookData.isStarred;
      updateStarButton(bookData.isStarred);
      showToast(result.message);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error toggling star:', error);
    showToast(error.message || 'Failed to update star status', 'error');
  }
}

function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(1rem)';
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(1rem)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  fetchBookDetails();
  const borrowBtn = document.getElementById('borrowBtn');
  if (borrowBtn) {
    borrowBtn.addEventListener('click', openBorrowModal);
  }
  const buyBtn = document.getElementById('buyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', buyBook);
  }
});

function openBorrowModal() {
  const modal = document.getElementById('borrowModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const borrowDate = document.getElementById('borrowDate');
  const returnDate = document.getElementById('returnDate');
  borrowDate.value = new Date().toISOString().split('T')[0];
  returnDate.value = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  updateDurationAndPrice();
  borrowDate.addEventListener('change', updateDurationAndPrice);
  returnDate.addEventListener('change', updateDurationAndPrice);
  document.getElementById('cancelBorrowBtn').addEventListener('click', closeBorrowModal);
  document.getElementById('confirmBorrowBtn').addEventListener('click', confirmBorrow);
}

function closeBorrowModal() {
  const modal = document.getElementById('borrowModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function updateDurationAndPrice() {
  const borrowDate = new Date(document.getElementById('borrowDate').value);
  const returnDate = new Date(document.getElementById('returnDate').value);
  const duration = Math.ceil((returnDate - borrowDate) / (1000 * 60 * 60 * 24));
  const dailyPrice = parseFloat(bookData.rental_price) || 0;
  const totalPrice = dailyPrice * duration;
  document.getElementById('duration').textContent = duration;
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

async function confirmBorrow() {
  const borrowDate = document.getElementById('borrowDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const duration = parseInt(document.getElementById('duration').textContent);
  if (duration < 1 || duration > 30) {
    showToast('Invalid rental duration. Must be between 1 and 30 days.', 'error');
    return;
  }
  try {
    const response = await fetch(`/user/books/${bookData.book_id}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rental_start_date: borrowDate, rental_end_date: returnDate })
    });
    const result = await response.json();
    if (response.ok) {
      bookData.no_of_copies_available--;
      bookData.userBorrowed = true;
      document.getElementById('availableCopies').textContent = bookData.no_of_copies_available;
      updateBorrowReturnSection(bookData);
      showToast(result.message);
      closeBorrowModal();
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    showToast('Failed to borrow book', 'error');
  }
}

async function buyBook() {
  if (!bookData) return;
  
  // Show confirmation modal
  const modal = document.getElementById('buyConfirmationModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Update confirmation message with book title
  const confirmMessage = modal.querySelector('p');
  confirmMessage.textContent = `Are you sure you want to purchase "${bookData.title}"?`;
  
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
      const response = await fetch(`/user/books/${bookData.book_id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (response.ok) {
        showToast(result.message || 'Book purchased successfully');
        // Close modal
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        // Refresh book details
        fetchBookDetails();
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