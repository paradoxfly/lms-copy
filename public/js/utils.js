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
          <div class="p-4 pt-0 flex gap-2 ${book.isBorrowed ? "hidden" : ""}">
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
