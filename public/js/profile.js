document.addEventListener('DOMContentLoaded', function() {
    // Profile Picture Upload
    const profilePicInput = document.getElementById('profile_picture');
    const profilePicture = document.querySelector('.profile-picture');
    const uploadOverlay = document.querySelector('.upload-overlay');

    if (uploadOverlay) {
        uploadOverlay.addEventListener('click', () => profilePicInput.click());
    }

    if (profilePicInput) {
        profilePicInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicture.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Edit Profile Form
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileForm = document.getElementById('edit-profile-form');
    const cancelBtn = document.querySelector('.cancel-btn');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.classList.remove('hidden');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editProfileModal.classList.add('hidden');
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(editProfileForm);
            
            try {
                const response = await fetch('/profile', {
                    method: 'PUT',
                    body: formData
                });

                const result = await response.json();
                
                if (response.ok) {
                    // Update UI with new data
                    document.querySelector('.profile-info p').textContent = formData.get('bio');
                    editProfileModal.classList.add('hidden');
                    
                    // Show success message
                    showNotification('Profile updated successfully', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Change Password Form
    const changePasswordForm = document.getElementById('change-password-form');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(changePasswordForm);
            const data = {
                currentPassword: formData.get('current_password'),
                newPassword: formData.get('new_password'),
                confirmPassword: formData.get('confirm_password')
            };

            // Validate passwords match
            if (data.newPassword !== data.confirmPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }

            try {
                const response = await fetch('/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.ok) {
                    changePasswordForm.reset();
                    showNotification('Password updated successfully', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Borrowing History
    const borrowingHistoryContainer = document.getElementById('borrowing-history');
    let currentPage = 1;

    async function loadBorrowingHistory(page = 1) {
        try {
            const response = await fetch(`/profile/borrowing-history?page=${page}`);
            const data = await response.json();
            
            if (response.ok) {
                // Update UI with borrowing history
                borrowingHistoryContainer.innerHTML = data.transactions.map(tx => `
                    <div class="book-transaction ${tx.status}">
                        <div class="book-info">
                            <img src="${tx.book.image || '/images/default-book.jpg'}" alt="${tx.book.title}">
                            <div>
                                <h3>${tx.book.title}</h3>
                                <p>${tx.book.author}</p>
                            </div>
                        </div>
                        <div class="transaction-info">
                            <p>Borrowed: ${new Date(tx.rental_start_date).toLocaleDateString()}</p>
                            <p>Due: ${new Date(tx.due_date).toLocaleDateString()}</p>
                            ${tx.returned_at ? 
                                `<p>Returned: ${new Date(tx.returned_at).toLocaleDateString()}</p>` : 
                                ''
                            }
                            ${tx.late_fee ? 
                                `<p class="late-fee">Late Fee: $${tx.late_fee.toFixed(2)}</p>` : 
                                ''
                            }
                            <span class="status-badge ${tx.status}">${tx.status}</span>
                        </div>
                    </div>
                `).join('');

                // Update pagination
                updatePagination(data.pagination);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    function updatePagination(pagination) {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        currentPage = pagination.current_page;
        
        paginationContainer.innerHTML = `
            <button class="prev-btn" ${!pagination.has_prev ? 'disabled' : ''}>
                Previous
            </button>
            <span>Page ${pagination.current_page} of ${pagination.total_pages}</span>
            <button class="next-btn" ${!pagination.has_next ? 'disabled' : ''}>
                Next
            </button>
        `;

        // Add event listeners to pagination buttons
        const prevBtn = paginationContainer.querySelector('.prev-btn');
        const nextBtn = paginationContainer.querySelector('.next-btn');

        if (prevBtn && pagination.has_prev) {
            prevBtn.addEventListener('click', () => loadBorrowingHistory(currentPage - 1));
        }
        if (nextBtn && pagination.has_next) {
            nextBtn.addEventListener('click', () => loadBorrowingHistory(currentPage + 1));
        }
    }

    // Load initial borrowing history
    if (borrowingHistoryContainer) {
        loadBorrowingHistory();
    }

    // Notification Helper
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Genre management
    const addGenreBtn = document.querySelector('.add-genre');
    const genresContainer = document.querySelector('.genres-container');
    
    if (addGenreBtn && genresContainer) {
        addGenreBtn.addEventListener('click', () => {
            const newGenre = prompt('Enter a new genre:');
            if (newGenre && newGenre.trim()) {
                const genreTag = document.createElement('div');
                genreTag.className = 'genre-tag';
                genreTag.innerHTML = `
                    <span>${newGenre.trim()}</span>
                    <button class="remove-genre">×</button>
                `;
                genresContainer.appendChild(genreTag);
            }
        });

        genresContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-genre')) {
                e.target.closest('.genre-tag').remove();
            }
        });
    }

    // Follow/Unfollow functionality
    const followBtn = document.querySelector('.follow-btn');
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            const username = followBtn.dataset.username;
            const isFollowing = followBtn.dataset.following === 'true';
            
            fetch(`/api/profile/${username}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    followBtn.dataset.following = !isFollowing;
                    followBtn.innerHTML = isFollowing ? 
                        '<i class="fas fa-user-plus"></i> Follow' : 
                        '<i class="fas fa-user-minus"></i> Unfollow';
                } else {
                    alert('Failed to update follow status: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating follow status');
            });
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            editProfileModal.classList.add('hidden');
        }
    });
}); 