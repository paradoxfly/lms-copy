document.addEventListener('DOMContentLoaded', function() {
    // Profile picture upload functionality
    const profilePictureContainer = document.querySelector('.profile-picture-container');
    const profilePictureInput = document.querySelector('#profile_picture');
    const profilePicture = document.querySelector('.profile-picture');
    const uploadOverlay = document.querySelector('.upload-overlay');

    if (profilePictureContainer && profilePictureInput) {
        profilePictureContainer.addEventListener('click', () => {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicture.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
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

    // Modal functionality
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const modal = document.querySelector('.modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');

    if (editProfileBtn && modal) {
        editProfileBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        const closeModal = () => {
            modal.style.display = 'none';
        };

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (saveBtn) saveBtn.addEventListener('click', () => {
            // Handle profile update
            const formData = new FormData();
            formData.append('bio', document.querySelector('#bio').value);
            
            // Handle reading preferences
            const preferences = {};
            document.querySelectorAll('.preference-item input').forEach(input => {
                const key = input.name.match(/\[(.*?)\]/)[1];
                preferences[key] = input.value;
            });
            formData.append('reading_preferences', JSON.stringify(preferences));
            
            // Handle favorite genres
            const genres = Array.from(document.querySelectorAll('.genre-tag span'))
                .map(span => span.textContent.trim());
            formData.append('favorite_genres', JSON.stringify(genres));
            
            if (profilePictureInput.files[0]) {
                formData.append('profile_picture', profilePictureInput.files[0]);
            }

            fetch('/api/profile/update', {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the profile information on the page
                    document.querySelector('.bio').textContent = data.profile.bio;
                    
                    // Update reading preferences
                    const preferencesContainer = document.querySelector('.preferences-grid');
                    preferencesContainer.innerHTML = '';
                    Object.entries(data.profile.reading_preferences).forEach(([key, value]) => {
                        const preferenceItem = document.createElement('div');
                        preferenceItem.className = 'preference-item';
                        preferenceItem.innerHTML = `
                            <span class="label">${key}</span>
                            <span class="value">${value}</span>
                        `;
                        preferencesContainer.appendChild(preferenceItem);
                    });
                    
                    // Update genres
                    const genresContainer = document.querySelector('.genres-container');
                    genresContainer.innerHTML = '';
                    data.profile.favorite_genres.forEach(genre => {
                        const genreTag = document.createElement('div');
                        genreTag.className = 'genre-tag';
                        genreTag.innerHTML = `
                            <span>${genre}</span>
                            <button class="remove-genre">×</button>
                        `;
                        genresContainer.appendChild(genreTag);
                    });

                    closeModal();
                } else {
                    alert('Failed to update profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the profile');
            });
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
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}); 