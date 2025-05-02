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
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${idx + 1}</td>
        <td class="px-4 py-2">${book.title}</td>
        <td class="px-4 py-2">${book.borrowedOn ? new Date(book.borrowedOn).toLocaleDateString() : '-'}</td>
        <td class="px-4 py-2">${book.dueDate ? new Date(book.dueDate).toLocaleDateString() : '-'}</td>
        <td class="px-4 py-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(book.status)}">${book.status}</span>
        </td>
        <td class="px-4 py-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${typeBadgeClass(book.transactionType)}">${book.transactionType === 'RENTAL' ? 'Borrowed' : 'Purchased'}</span>
        </td>
      `;
      borrowedBooksTable.appendChild(tr);
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
  
  fetchMyBooks();
  