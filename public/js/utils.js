const renderBook = (book) => {
  const bookElement = document.createElement("div");
  bookElement.className =
    "book-card bg-white border rounded-xl overflow-hidden";

  const isAvailable = book.no_of_copies_available > 0;

  bookElement.innerHTML = `
          <div class="p-4 flex gap-4">
            <div class="flex-shrink-0">
              <img class="book-cover" src="${book.image}" alt="${book.title}" />
            </div>
            <div class="flex flex-col">
              <span class="${
                isAvailable ? "available-badge" : "unavailable-badge"
              }">
                ${isAvailable ? "Available" : "Unavailable"}
              </span>
              <h3 class="text-sm font-semibold mb-1">${book.title}</h3>
              <p class="text-xs text-gray-500 mb-2">${book.author}</p>
              <p class="text-xs text-gray-500 mb-1">
                ${book.description.slice(0, 100)}...
                <span class="read-more"> Read more...</span>
              </p>
              <div class="flex items-center gap-2 mt-auto">
                <button class="action-button like-button ${
                  book.isLiked ? "active" : ""
                }" data-book-id="${book.book_id}">
                  <i class="${book.isLiked ? "fas" : "far"} fa-heart"></i>
                </button>
                <button class="action-button star-button ${
                  book.isStarred ? "active" : ""
                }" data-book-id="${book.book_id}">
                  <i class="${book.isStarred ? "fas" : "far"} fa-star"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 pt-0 flex gap-2">
            <button class="borrow-button flex-1 py-1 text-sm ${
              !isAvailable ? "disabled" : ""
            }" 
              ${!isAvailable ? "disabled" : ""} data-book-id="${book.book_id}">
              ${isAvailable ? "Borrow" : "Unavailable"}
            </button>
          </div>
      `;

  // Add event listeners for like and star buttons
  const likeButton = bookElement.querySelector(".like-button");
  const starButton = bookElement.querySelector(".star-button");

  likeButton.addEventListener("click", async () => {
    likeButton.classList.add("loading");
    try {
      const response = await fetch(`/user/books/${book.book_id}/like`, {
        method: "POST",
      });
      const data = await response.json();

      likeButton.classList.toggle("active");
      likeButton.querySelector("i").classList.toggle("far");
      likeButton.querySelector("i").classList.toggle("fas");

      showToast(data.message);
    } catch (error) {
      showToast("Failed to update like status", "error");
    }
    likeButton.classList.remove("loading");
  });

  starButton.addEventListener("click", async () => {
    starButton.classList.add("loading");
    try {
      const response = await fetch(`/user/books/${book.book_id}/star`, {
        method: "POST",
      });
      const data = await response.json();

      starButton.classList.toggle("active");
      starButton.querySelector("i").classList.toggle("far");
      starButton.querySelector("i").classList.toggle("fas");

      showToast(data.message);
    } catch (error) {
      showToast("Failed to update star status", "error");
    }
    starButton.classList.remove("loading");
  });

  // Add borrow button event listener
  const borrowButton = bookElement.querySelector(".borrow-button");
  if (isAvailable) {
    borrowButton.addEventListener("click", async () => {
      borrowButton.classList.add("loading");
      try {
        const response = await fetch(`/user/books/${book.book_id}/borrow`, {
          method: "POST",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        // Update UI to reflect new availability
        if (data.availableCopies <= 0) {
          borrowButton.classList.add("disabled");
          borrowButton.disabled = true;
          borrowButton.textContent = "Unavailable";
          const badge = bookElement.querySelector(".available-badge");
          badge.className = "unavailable-badge";
          badge.textContent = "Unavailable";
        }

        showToast(data.message);
      } catch (error) {
        showToast(error.message || "Failed to borrow book", "error");
      }
      borrowButton.classList.remove("loading");
    });
  }

  return bookElement;
};

// Add toast notification function
const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = "toast";
  if (type === "success") {
    toast.style.backgroundColor = "#22c55e";
  } else {
    toast.style.backgroundColor = "#fe4e4e";
  }
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
};

/**
 * Show a borrow modal and return a Promise with {rental_start_date, rental_end_date} or null if cancelled.
 * @param {Object} options - { dailyPrice: number, maxDuration: number }
 * @returns {Promise<{rental_start_date: string, rental_end_date: string} | null>}
 */
window.showBorrowModal = function({ dailyPrice = 0, maxDuration = 30 } = {}) {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existing = document.getElementById('global-borrow-modal');
    if (existing) existing.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'global-borrow-modal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Borrow Book</h3>
        <p class="text-gray-600 mb-4">Please select your borrow and return dates:</p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Borrow Date</label>
          <input id="modalBorrowDate" class="w-full mt-1 p-2 border rounded" type="date">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Return Date</label>
          <input id="modalReturnDate" class="w-full mt-1 p-2 border rounded" type="date">
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-600">Duration: <span id="modalDuration">0</span> days</p>
          <p class="text-sm text-gray-600">Total Price: $<span id="modalTotalPrice">0.00</span></p>
        </div>
        <div class="mb-4 p-2 bg-yellow-50 text-yellow-700 rounded">
          <p class="text-sm">A 50p/day fine will be incurred and will be automatically charged to wallet.</p>
        </div>
        <div class="flex justify-end gap-4">
          <button id="modalCancelBorrowBtn" class="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button id="modalConfirmBorrowBtn" class="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Confirm Borrow</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Set default dates
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultReturn = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const borrowDateInput = document.getElementById('modalBorrowDate');
    const returnDateInput = document.getElementById('modalReturnDate');
    borrowDateInput.value = todayStr;
    borrowDateInput.min = todayStr;
    returnDateInput.value = defaultReturn;
    returnDateInput.min = todayStr;

    function updateDurationAndPrice() {
      const borrowDate = new Date(borrowDateInput.value);
      const returnDate = new Date(returnDateInput.value);
      const duration = Math.ceil((returnDate - borrowDate) / (1000 * 60 * 60 * 24));
      document.getElementById('modalDuration').textContent = duration;
      document.getElementById('modalTotalPrice').textContent = (dailyPrice * duration).toFixed(2);
    }
    borrowDateInput.addEventListener('change', updateDurationAndPrice);
    returnDateInput.addEventListener('change', updateDurationAndPrice);
    updateDurationAndPrice();

    document.getElementById('modalCancelBorrowBtn').onclick = () => {
      modal.remove();
      resolve(null);
    };
    document.getElementById('modalConfirmBorrowBtn').onclick = () => {
      const borrowDate = borrowDateInput.value;
      const returnDate = returnDateInput.value;
      const duration = Math.ceil((new Date(returnDate) - new Date(borrowDate)) / (1000 * 60 * 60 * 24));
      if (duration < 1 || duration > maxDuration) {
        showToast('Invalid rental duration. Must be between 1 and 30 days.', 'error');
        return;
      }
      modal.remove();
      resolve({ rental_start_date: borrowDate, rental_end_date: returnDate });
    };
  });
};
