// assets/js/main.js

// ============================================
// CART FUNCTIONALITY
// ============================================
let cart = [];
let cartTotal = 0;

// Initialize cart from localStorage if available
if (localStorage.getItem('cart')) {
    try {
        cart = JSON.parse(localStorage.getItem('cart'));
        updateCart();
    } catch(e) {
        console.error('Error loading cart from localStorage:', e);
    }
}

// Add to cart function
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${name} added to cart!`);
}

// Update cart UI
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount, #cartCountMobile');
    cartCountElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
    
    // Update cart items list
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        let cartTotal = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map(item => {
                const itemTotal = item.price * item.quantity;
                cartTotal += itemTotal;
                
                return `
                    <div class="cart-item">
                        <div class="cart-item-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${item.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }
        
        // Update total
        const cartTotalEl = document.getElementById('cartTotal');
        if (cartTotalEl) cartTotalEl.textContent = `$${cartTotal.toFixed(2)}`;
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
    showNotification('Item removed from cart');
}

// Show cart
function showCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (cartSidebar) cartSidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
}

// Close cart
function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Thank you for your order! Total: $${total.toFixed(2)}\n\nThis is a demo. In a real application, this would proceed to payment.`);
    cart = [];
    localStorage.removeItem('cart');
    updateCart();
    closeCart();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'position-fixed top-0 end-0 m-3 p-3 bg-success text-white rounded shadow';
    notification.style.zIndex = '9999';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// DEMO SHOWCASE FILTERING - BY CATEGORY ID
// ============================================

// Initialize category filtering
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing filters by category ID');
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    const demoItems = document.querySelectorAll('.demo-item');
    const loadMoreBtn = document.getElementById('loadMore');
    
    console.log('Found ' + categoryButtons.length + ' category buttons');
    console.log('Found ' + demoItems.length + ' demo items');
    
    // Debug: Log all demo category IDs
    if (demoItems.length > 0) {
        console.log('Demo category IDs:');
        demoItems.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.dataset.categoryId}, Name: ${item.dataset.categoryName}`);
        });
    }
    
    // Add click event to each category button
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get selected category ID and name
            const selectedCategoryId = this.getAttribute('data-category-id');
            const selectedCategoryName = this.getAttribute('data-category-name') || 'all';
            
            console.log('Category clicked - ID: ' + selectedCategoryId + ', Name: ' + selectedCategoryName);
            
            // Update active button
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Filter demos by category ID
            filterDemosByCategoryId(selectedCategoryId);
        });
    });
    
    // Initialize load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreDemosById);
    }
});


// Filter demos by category ID - SHOW ALL for categories, PAGINATED for "All Demos"
function filterDemosByCategoryId(categoryId) {
    console.log('Filtering by category ID:', categoryId);
    
    if (categoryId == 0) {
        // For "All Demos", show paginated view (first 6 items)
        fetchPaginatedDemos(categoryId, 1);
    } else {
        // For specific categories, fetch ALL demos from that category
        fetchAllDemosByCategory(categoryId);
    }
}

// Fetch paginated demos (for "All Demos" view)
function fetchPaginatedDemos(categoryId, page) {
    const loading = document.getElementById('loading');
    const demoGrid = document.getElementById('demoGrid');
    const loadMoreBtn = document.getElementById('loadMore');
    
    // Show loading
    if (loading) loading.style.display = 'block';
    
    // Hide load more button while loading
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    
    // Use normal pagination (6 items per page)
    const perPage = 6;
    
    fetch(`ajax/load-more-demos.php?page=${page}&category_id=${categoryId}&per_page=${perPage}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetch paginated response:', data);
            
            if (data.success && data.demos.length > 0) {
                // Clear existing grid
                demoGrid.innerHTML = '';
                
                // Add demos from this page
                data.demos.forEach(demo => {
                    const demoCategoryId = demo.ctg_id || 0;
                    const demoCategoryName = demo.category_name || 'Uncategorized';
                    const demoItem = createDemoElementById(demo, demoCategoryId, demoCategoryName);
                    demoGrid.appendChild(demoItem);
                });
                
                // Show/hide load more button based on whether there are more items
                if (data.hasMore) {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.setAttribute('data-page', page);
                    loadMoreBtn.setAttribute('data-category-id', categoryId);
                } else {
                    loadMoreBtn.style.display = 'none';
                }
                
                console.log(`Loaded page ${page} with ${data.demos.length} demos for All Demos`);
            } else {
                demoGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No demos found</p></div>';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
            
            if (loading) loading.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching demos:', error);
            if (loading) loading.style.display = 'none';
        });
}

// Fetch ALL demos for a specific category
function fetchAllDemosByCategory(categoryId) {
    const loading = document.getElementById('loading');
    const demoGrid = document.getElementById('demoGrid');
    const loadMoreBtn = document.getElementById('loadMore');
    
    // Show loading
    if (loading) loading.style.display = 'block';
    
    // Hide load more button while loading (categories show all at once)
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    
    // Use a large per_page value to get all demos for this category
    const perPage = 100; // Get up to 100 demos
    
    fetch(`ajax/load-more-demos.php?page=1&category_id=${categoryId}&per_page=${perPage}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetch all response:', data);
            
            if (data.success && data.demos.length > 0) {
                // Clear existing grid
                demoGrid.innerHTML = '';
                
                // Add all demos from this category
                data.demos.forEach(demo => {
                    const demoCategoryId = demo.ctg_id || 0;
                    const demoCategoryName = demo.category_name || 'Uncategorized';
                    const demoItem = createDemoElementById(demo, demoCategoryId, demoCategoryName);
                    demoGrid.appendChild(demoItem);
                });
                
                // Hide load more button for category view (all items already loaded)
                loadMoreBtn.style.display = 'none';
                
                console.log(`Loaded ${data.demos.length} demos for category ${categoryId}`);
            } else {
                // No demos in this category
                demoGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No demos found in this category</p></div>';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
            
            if (loading) loading.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching demos:', error);
            if (loading) loading.style.display = 'none';
        });
}

// Update the load more function to work with pagination
function loadMoreDemosById() {
    const loadMoreBtn = document.getElementById('loadMore');
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page')) || 1;
    const categoryId = loadMoreBtn.getAttribute('data-category-id') || '0';
    
    // For "All Demos" (categoryId=0), load the next page
    if (categoryId == 0) {
        fetchPaginatedDemos(0, currentPage + 1);
    } else {
        // For categories, we shouldn't get here since load more is hidden
        console.log('Load more not applicable for category view');
    }
}


function showDemoDetails(demoId) {
    window.location.href = 'demo-details.php?id=' + demoId;
}



// Helper function to hide items with animation
function hideItemById(item, categoryId) {
    item.classList.add('hidden');
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
        // Only hide if still not matching after animation
        if (item.classList.contains('hidden')) {
            const itemCategoryId = item.getAttribute('data-category-id');
            if (categoryId != 0 && itemCategoryId != categoryId) {
                item.style.display = 'none';
            }
        }
    }, 300);
}

// Update load more button visibility based on filter
function updateLoadMoreVisibilityById(categoryId, visibleCount) {
    const loadMoreBtn = document.getElementById('loadMore');
    if (!loadMoreBtn) return;
    
    // Reset page counter
    loadMoreBtn.setAttribute('data-page', '1');
    loadMoreBtn.setAttribute('data-category-id', categoryId);
    
    if (categoryId == 0) {
        const totalAll = document.querySelectorAll('.demo-item').length;
        if (visibleCount >= totalAll) {
            loadMoreBtn.style.display = 'none';
            console.log('Load more hidden: all items visible');
        } else {
            loadMoreBtn.style.display = 'block';
            console.log('Load more shown: ' + (totalAll - visibleCount) + ' more available');
        }
    } else {
        const totalInCategory = document.querySelectorAll(`.demo-item[data-category-id="${categoryId}"]`).length;
        if (visibleCount >= totalInCategory) {
            loadMoreBtn.style.display = 'none';
            console.log(`Load more hidden: all category ID ${categoryId} items visible`);
        } else {
            loadMoreBtn.style.display = 'block';
            console.log(`Load more shown: ${totalInCategory - visibleCount} more category ID ${categoryId} items available`);
        }
    }
}

// Load more demos function (by ID)
function loadMoreDemosById() {
    const loadMoreBtn = document.getElementById('loadMore');
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page')) || 1;
    const activeButton = document.querySelector('.category-btn.active');
    const categoryId = activeButton ? activeButton.getAttribute('data-category-id') : '0';
    const loading = document.getElementById('loading');
    
    console.log('Load more clicked - Page: ' + (currentPage + 1) + ', Category ID: ' + categoryId);
    
    // Show loading
    loadMoreBtn.style.display = 'none';
    if (loading) loading.style.display = 'block';
    
    // Fetch more demos
    fetch(`ajax/load-more-demos.php?page=${currentPage + 1}&category_id=${categoryId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Load more response:', data);
            
            if (data.success && data.demos.length > 0) {
                const demoGrid = document.getElementById('demoGrid');
                
                data.demos.forEach(demo => {
                    // Use ctg_id from the database
                    const demoCategoryId = demo.ctg_id || 0;
                    const demoCategoryName = demo.category_name || 'Uncategorized';
                    
                    const demoItem = createDemoElementById(demo, demoCategoryId, demoCategoryName);
                    demoGrid.appendChild(demoItem);
                    
                    // If a category filter is active and this item doesn't match, hide it
                    if (categoryId != 0 && demoCategoryId != categoryId) {
                        const newItem = demoGrid.lastElementChild;
                        newItem.style.display = 'none';
                        newItem.classList.add('hidden');
                    }
                });
                
                // Update page number
                loadMoreBtn.setAttribute('data-page', currentPage + 1);
                
                // Hide button if no more demos
                if (!data.hasMore) {
                    loadMoreBtn.style.display = 'none';
                    console.log('No more demos to load');
                } else {
                    loadMoreBtn.style.display = 'block';
                }
            } else {
                loadMoreBtn.style.display = 'none';
            }
            
            if (loading) loading.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading more demos:', error);
            if (loading) loading.style.display = 'none';
            loadMoreBtn.style.display = 'block';
        });
}

// Create demo element function (by ID)
function createDemoElementById(demo, categoryId, categoryName) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-lg-4 col-md-6 demo-item';
    colDiv.setAttribute('data-category-id', categoryId);
    colDiv.setAttribute('data-category-name', categoryName);
    
    const isNew = demo.is_new ? '<span class="demo-badge-new">' + getLangText('New', 'নতুন') + '</span>' : '';
    const lang = document.documentElement.lang || 'en';
    
    // Determine which language to use
    const demoTitle = (lang === 'bn' && demo.demo_title_bn) ? demo.demo_title_bn : demo.demo_title_en;
    const toolsTitle = (lang === 'bn' && demo.tools_title_bn) ? demo.tools_title_bn : demo.tools_title_en;
    const badgeSite = (lang === 'bn' && demo.badge_site_bn) ? demo.badge_site_bn : demo.badge_site_en;
    const rentText = lang === 'bn' ? 'ভাড়া' : 'RENT';
    const buyText = lang === 'bn' ? 'কিনুন' : 'BUY';
    const liveDemoText = lang === 'bn' ? 'লাইভ ডেমো' : 'Live Demo';
    const detailsText = lang === 'bn' ? 'বিস্তারিত' : 'Details';
    
    colDiv.innerHTML = `
        <div class="portfolio-card">
            <div class="demo-card">
                <div class="demo-image">
                    <img src="uploads/demos/${demo.image || ''}" class="demo-img-fluid" alt="${demoTitle || ''}">
                    <span class="demo-badge-site">${badgeSite || ''}</span>
                    ${isNew}
                </div>
                <div class="demo-content">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h2 class="demo-title mb-0">${demoTitle || ''}</h2>
                        <h2 class="tools-title mb-0">${toolsTitle || ''}</h2>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0">${rentText}: ৳${parseFloat(demo.rent_price || 0).toFixed(2)}/month</h6>
                        <h6 class="mb-0">${buyText}: ৳${parseFloat(demo.price || 0).toFixed(2)}</h6>
                    </div>
                        
                    <div class="demo-actions">
                        <a href="${demo.demo_link || '#'}" target="_blank" class="demo-btn btn-live" style="color: #f0f9ff;">
                            <i class="fas fa-external-link-alt"></i> ${liveDemoText}
                        </a>
                        <button class="demo-btn btn-outline" onclick="showDemoDetails(${demo.id})">
                            <i class="fas fa-info-circle"></i> ${detailsText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return colDiv;
}

// Show demo details modal
function showDemoDetails(demoId) {
    fetch(`ajax/get-demo-details.php?id=${demoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                
                // Get category name from the response
                const categoryName = data.demo.category_name || data.demo.category || 'Uncategorized';
                
                modal.innerHTML = `
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${data.demo.demo_title_en || ''}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <img src="uploads/demos/${data.demo.image || ''}" class="img-fluid rounded" alt="${data.demo.demo_title_en || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <h4>Details</h4>
                                        <p>${data.demo.details_en || 'No details available'}</p>
                                        <p><strong>Category:</strong> ${categoryName}</p>
                                        <p><strong>Technology:</strong> ${data.demo.tools_title_en || ''}</p>
                                        <p><strong>Price:</strong> ৳${parseFloat(data.demo.price || 0).toFixed(2)}</p>
                                        <p><strong>Rent Price:</strong> ৳${parseFloat(data.demo.rent_price || 0).toFixed(2)}/month</p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <a href="${data.demo.demo_link || '#'}" target="_blank" class="btn btn-primary">
                                    <i class="fas fa-external-link-alt"></i> View Live Demo
                                </a>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
                
                modal.addEventListener('hidden.bs.modal', function() {
                    modal.remove();
                });
            } else {
                alert('Error loading demo details');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading demo details');
        });
}

// ============================================
// SMOOTH SCROLLING
// ============================================

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (href === '#' || href === '#!') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            
            // Calculate offset for fixed navbar
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            // Add smooth scrolling
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Close mobile navbar after clicking a link
            if (window.innerWidth < 992) {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse?.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            }
        }
    });
});

// Navigate to section without using anchor tags
function navigateToSection(sectionId, clickedItem) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        // Calculate offset for fixed navbar
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        // Smooth scroll to section
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Set active state
        setActiveDropdownItem(clickedItem);
        
        // Update URL without page reload
        history.pushState(null, null, `#${sectionId}`);
        
        // Close mobile navbar if open
        if (window.innerWidth < 992) {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse?.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        }
    }
}

// Set active dropdown item
function setActiveDropdownItem(clickedItem) {
    // Remove current-active class from all dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('current-active');
    });
    
    // Add current-active class to clicked item
    if (clickedItem) {
        clickedItem.classList.add('current-active');
    }
}

// ============================================
// DARK MODE TOGGLE
// ============================================

const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme or preferred scheme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 
                    (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateToggleButton(true);
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateToggleButton(false);
    }
}

// Update toggle button state
function updateToggleButton(isDark) {
    if (!darkModeToggle) return;
    
    if (isDark) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        darkModeToggle.classList.remove('btn-outline-secondary');
        darkModeToggle.classList.add('btn-primary');
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.classList.remove('btn-primary');
        darkModeToggle.classList.add('btn-outline-secondary');
    }
}

// Toggle theme function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        // Switch to light mode
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateToggleButton(false);
    } else {
        // Switch to dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateToggleButton(true);
    }
    
    // Smooth transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

// Event listeners for dark mode
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleTheme);
}

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        initTheme();
    }
});

// ============================================
// LANGUAGE TOGGLE
// ============================================

const languageToggle = document.getElementById('languageToggle');

// Check for saved language preference
function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    
    if (savedLang === 'bn') {
        setLanguage('bn');
    } else {
        setLanguage('en');
    }
}

// Set language function
function setLanguage(lang) {
    if (!languageToggle) return;
    
    if (lang === 'bn') {
        // Switch to Bangla
        document.documentElement.lang = 'bn';
        localStorage.setItem('language', 'bn');
        updateContent('bn');
        
        // Update button text
        languageToggle.innerHTML = 'বাং';
        languageToggle.classList.add('active');
    } else {
        // Switch to English (default)
        document.documentElement.lang = 'en';
        localStorage.setItem('language', 'en');
        updateContent('en');
        
        // Update button text
        languageToggle.innerHTML = 'EN';
        languageToggle.classList.remove('active');
    }
}

// Toggle language function
function toggleLanguage() {
    const currentLang = localStorage.getItem('language') || 'en';
    
    if (currentLang === 'en') {
        setLanguage('bn');
    } else {
        setLanguage('en');
    }
}

// Event listener for language toggle
if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguage);
}

// Helper function to get text based on language
function getLangText(en, bn) {
    return (localStorage.getItem('language') || 'en') === 'bn' ? bn : en;
}

// Update content based on language
function updateContent(lang) {
    if (lang === 'bn') {
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks[0]) navLinks[0].textContent = 'হোম';
        if (navLinks[5]) navLinks[5].textContent = 'পোর্টফোলিও';
        
        const dropdownToggle = document.querySelector('#othesDropdown');
        if (dropdownToggle) dropdownToggle.textContent = 'অন্যান্য';
        
        // Update hero section
        const titleMain = document.querySelector('.title-main');
        if (titleMain) titleMain.textContent = 'একটি প্রকল্পের পরিকল্পনা আছে?';
        
        const subTitle = document.querySelector('.sub-title');
        if (subTitle) subTitle.textContent = 'আপনাকে সফল করতে আমরা কীভাবে সাহায্য করতে পারি তা আলোচনা করা যাক।';
        
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.innerHTML = 'ই-কমার্স প্ল্যাটফর্ম, নিউজ পোর্টাল, ব্লগ, এসএএএস অ্যাপ্লিকেশন, এডুকেশন পোর্টাল সহ আমাদের পেশাদারভাবে তৈরি লারাভেল অ্যাপ্লিকেশনগুলির সংগ্রহটি অন্বেষণ করুন। প্রতিটি ডেমো আমাদের উন্নয়ন ক্ষমতা প্রদর্শন করে।';
        
        // Update buttons
        const viewDemosBtn = document.querySelector('.btn-primary .fa-eye + span');
        if (viewDemosBtn) viewDemosBtn.textContent = 'ডেমো দেখুন';
        
        const mainSiteBtn = document.querySelector('.btn-outline-primary .fa-globe + span');
        if (mainSiteBtn) mainSiteBtn.textContent = 'প্রধান সাইট';
        
        const contactBtn = document.querySelector('.btn-outline-primary .fa-envelope + span');
        if (contactBtn) contactBtn.textContent = 'যোগাযোগ করুন';
        
        // Update section titles
        const servicesTitle = document.querySelector('#services-title');
        if (servicesTitle) servicesTitle.textContent = 'আমাদের সমস্ত লাইভ ডেমো দেখুন';
        
        const servicesDesc = document.querySelector('#services-desc');
        if (servicesDesc) servicesDesc.textContent = 'প্রতিটি ডেমো সম্পূর্ণ কার্যকরী এবং ওয়েব উন্নয়নের বিভিন্ন দিক প্রদর্শন করে';
        
        // Update category buttons using data attributes
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            if (btn.id === 'category-all') {
                btn.textContent = 'সব ডেমো';
            } else {
                const bnText = btn.getAttribute('data-category-bn');
                if (bnText) btn.textContent = bnText;
            }
        });
        
        // Hide English elements, show Bangla elements
        document.querySelectorAll('.demo-title-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.demo-title-bn').forEach(el => el.style.display = 'block');
        
        document.querySelectorAll('.tools-title-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tools-title-bn').forEach(el => el.style.display = 'block');
        
        document.querySelectorAll('.rent-price-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.rent-price-bn').forEach(el => el.style.display = 'block');
        
        document.querySelectorAll('.buy-price-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.buy-price-bn').forEach(el => el.style.display = 'block');
        
        document.querySelectorAll('.live-demo-text-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.live-demo-text-bn').forEach(el => el.style.display = 'inline');
        
        document.querySelectorAll('.details-text-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.details-text-bn').forEach(el => el.style.display = 'inline');
        
        document.querySelectorAll('.load-more-text-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.load-more-text-bn').forEach(el => el.style.display = 'inline');
        
        document.querySelectorAll('.loading-text-en').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.loading-text-bn').forEach(el => el.style.display = 'block');
        
        // Update portfolio section
        const portfolioTitle = document.querySelector('#portfolio h2');
        if (portfolioTitle) portfolioTitle.textContent = 'আমাদের পোর্টফোলিও';
        
        const portfolioDesc = document.querySelector('#portfolio p');
        if (portfolioDesc) portfolioDesc.textContent = 'আমাদের সাম্প্রতিক কাজ এবং ক্লায়েন্ট প্রকল্পগুলি দেখুন';
        
        // Update technology section
        const techTitle = document.querySelector('#technology h2');
        if (techTitle) techTitle.textContent = 'প্রযুক্তি স্ট্যাক';
        
        const techDesc = document.querySelector('#technology p');
        if (techDesc) techDesc.textContent = 'আমাদের ডেমোগুলি আধুনিক প্রযুক্তি এবং সর্বোত্তম অনুশীলন দিয়ে নির্মিত';
        
        // Update features section
        const featuresTitle = document.querySelector('#features h2');
        if (featuresTitle) featuresTitle.textContent = 'কেন আমাদের ডেমো বেছে নেবেন';
        
        const featuresDesc = document.querySelector('#features p');
        if (featuresDesc) featuresDesc.textContent = 'আমরা স্কেলযোগ্য, সুরক্ষিত এবং উচ্চ-প্রদর্শনকারী সমস্ত অ্যাপ্লিকেশন তৈরি করি';
        
        // Update feature cards
        const featureCards = document.querySelectorAll('.feature-card h4');
        const featureTextsBn = ['উচ্চ কর্মক্ষমতা', 'পরিষ্কার কোড', 'সম্পূর্ণ রেসপনসিভ', 'নিরাপদ', 'কাস্টমাইজযোগ্য', 'সহায়তা অন্তর্ভুক্ত'];
        featureCards.forEach((card, index) => {
            if (index < featureTextsBn.length) {
                card.textContent = featureTextsBn[index];
            }
        });
        
        // Update CTA section
        const ctaTitle = document.querySelector('.cta-title');
        if (ctaTitle) ctaTitle.textContent = 'আপনার ব্যবসা রূপান্তর করতে প্রস্তুত?';
        
        const ctaDesc = document.querySelector('.cta-section p');
        if (ctaDesc) ctaDesc.textContent = 'আজই আমাদের সাথে যোগাযোগ করুন আপনার প্রকল্প নিয়ে আলোচনা করতে এবং বিনামূল্যে পরামর্শ পান।';
        
        const ctaBtn = document.querySelector('.cta-section .btn-light');
        if (ctaBtn) ctaBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>বিনামূল্যে পরামর্শ পান';
        
        // Update contact section
        const contactTitle = document.querySelector('#contact h2');
        if (contactTitle) contactTitle.textContent = 'যোগাযোগ করুন';
        
        const contactDesc = document.querySelector('#contact p');
        if (contactDesc) contactDesc.textContent = 'আমাদের সমাধানে আগ্রহী? কাস্টম ডেভেলপমেন্টের জন্য আমাদের সাথে যোগাযোগ করুন';
        
        // Update footer
        const footerTitles = document.querySelectorAll('.footer-title');
        const footerTextsBn = ['নেক্সট ডিজিট', 'সেবাসমূহ', 'কোম্পানি', 'আমাদের প্রধান সাইট দেখুন'];
        footerTitles.forEach((title, index) => {
            if (index < footerTextsBn.length) {
                title.textContent = footerTextsBn[index];
            }
        });
        
        // Update WhatsApp tooltip
        const whatsappTooltip = document.querySelector('.whatsapp-tooltip');
        if (whatsappTooltip) whatsappTooltip.textContent = 'WhatsApp-এ আমাদের সাথে চ্যাট করুন';
        
    } else {
        // English mode - show English elements, hide Bangla elements
        
        // Update navigation to English
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks[0]) navLinks[0].textContent = 'Home';
        if (navLinks[5]) navLinks[5].textContent = 'Portfolio';
        
        const dropdownToggle = document.querySelector('#othesDropdown');
        if (dropdownToggle) dropdownToggle.textContent = 'Others';
        
        // Update hero section to English
        const titleMain = document.querySelector('.title-main');
        if (titleMain) titleMain.textContent = 'Have a project in mind?';
        
        const subTitle = document.querySelector('.sub-title');
        if (subTitle) subTitle.textContent = 'Let\'s discuss how we can help you succeed.';
        
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.innerHTML = 'Explore our collection of professionally built Web applications including E-commerce platforms, News portals, Blogs, SaaS Applications, Education Portals and more. Each demo showcases our development capabilities.';
        
        // Update buttons to English
        const viewDemosBtn = document.querySelector('.btn-primary .fa-eye + span');
        if (viewDemosBtn) viewDemosBtn.textContent = 'View Demos';
        
        const mainSiteBtn = document.querySelector('.btn-outline-primary .fa-globe + span');
        if (mainSiteBtn) mainSiteBtn.textContent = 'Main Site';
        
        const contactBtn = document.querySelector('.btn-outline-primary .fa-envelope + span');
        if (contactBtn) contactBtn.textContent = 'Contact Us';
        
        // Update section titles to English
        const servicesTitle = document.querySelector('#services-title');
        if (servicesTitle) servicesTitle.textContent = 'Browse Our All Live Demo Showcase';
        
        const servicesDesc = document.querySelector('#services-desc');
        if (servicesDesc) servicesDesc.textContent = 'Each demo is fully functional and showcases different aspects of Web development';
        
        // Update category buttons using data attributes
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            if (btn.id === 'category-all') {
                btn.textContent = 'All Demos';
            } else {
                const enText = btn.getAttribute('data-category-en');
                if (enText) btn.textContent = enText;
            }
        });
        
        // Show English elements, hide Bangla elements
        document.querySelectorAll('.demo-title-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.demo-title-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.tools-title-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.tools-title-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.rent-price-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.rent-price-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.buy-price-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.buy-price-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.live-demo-text-en').forEach(el => el.style.display = 'inline');
        document.querySelectorAll('.live-demo-text-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.details-text-en').forEach(el => el.style.display = 'inline');
        document.querySelectorAll('.details-text-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.load-more-text-en').forEach(el => el.style.display = 'inline');
        document.querySelectorAll('.load-more-text-bn').forEach(el => el.style.display = 'none');
        
        document.querySelectorAll('.loading-text-en').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.loading-text-bn').forEach(el => el.style.display = 'none');
        
        // Update portfolio section to English
        const portfolioTitle = document.querySelector('#portfolio h2');
        if (portfolioTitle) portfolioTitle.textContent = 'Our Portfolio';
        
        const portfolioDesc = document.querySelector('#portfolio p');
        if (portfolioDesc) portfolioDesc.textContent = 'Check out some of our recent work and client projects';
        
        // Update technology section to English
        const techTitle = document.querySelector('#technology h2');
        if (techTitle) techTitle.textContent = 'Technology Stack';
        
        const techDesc = document.querySelector('#technology p');
        if (techDesc) techDesc.textContent = 'Our demos are built with modern technologies and best practices';
        
        // Update features section to English
        const featuresTitle = document.querySelector('#features h2');
        if (featuresTitle) featuresTitle.textContent = 'Why Choose Our Demos';
        
        const featuresDesc = document.querySelector('#features p');
        if (featuresDesc) featuresDesc.textContent = 'We build scalable, secure, and high-performance All applications';
        
        // Update feature cards to English
        const featureCards = document.querySelectorAll('.feature-card h4');
        const featureTextsEn = ['High Performance', 'Clean Code', 'Fully Responsive', 'Secure', 'Customizable', 'Support Included'];
        featureCards.forEach((card, index) => {
            if (index < featureTextsEn.length) {
                card.textContent = featureTextsEn[index];
            }
        });
        
        // Update CTA section to English
        const ctaTitle = document.querySelector('.cta-title');
        if (ctaTitle) ctaTitle.textContent = 'Ready to Transform Your Business?';
        
        const ctaDesc = document.querySelector('.cta-section p');
        if (ctaDesc) ctaDesc.textContent = 'Contact us today to discuss your project and get a free consultation.';
        
        const ctaBtn = document.querySelector('.cta-section .btn-light');
        if (ctaBtn) ctaBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Get Free Consultation';
        
        // Update contact section to English
        const contactTitle = document.querySelector('#contact h2');
        if (contactTitle) contactTitle.textContent = 'Get In Touch';
        
        const contactDesc = document.querySelector('#contact p');
        if (contactDesc) contactDesc.textContent = 'Interested in our Next solutions? Contact us for custom development';
        
        // Update footer to English
        const footerTitles = document.querySelectorAll('.footer-title');
        const footerTextsEn = ['Next Digit', 'Services', 'Company', 'Visit Our Main Site'];
        footerTitles.forEach((title, index) => {
            if (index < footerTextsEn.length) {
                title.textContent = footerTextsEn[index];
            }
        });
        
        // Update WhatsApp tooltip to English
        const whatsappTooltip = document.querySelector('.whatsapp-tooltip');
        if (whatsappTooltip) whatsappTooltip.textContent = 'Chat with us on WhatsApp';
    }
}


// ============================================
// GO TO TOP ROCKET BUTTON
// ============================================
const goToTopBtn = document.getElementById('goToTop');

// Show/hide button on scroll
window.addEventListener('scroll', function() {
    if (goToTopBtn) {
        if (window.scrollY > 300) {
            goToTopBtn.classList.add('visible');
        } else {
            goToTopBtn.classList.remove('visible');
        }
    }
});

// Function to create star particles
function createStarParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star-particle';
        
        // Random size
        const size = Math.random() * 4 + 2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position around rocket
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30 + 10;
        const starX = x + Math.cos(angle) * distance;
        const starY = y + Math.sin(angle) * distance;
        
        star.style.left = `${starX}px`;
        star.style.top = `${starY}px`;
        
        // Random animation
        const duration = Math.random() * 0.5 + 0.3;
        const moveX = (Math.random() - 0.5) * 100;
        const moveY = (Math.random() - 0.5) * 100 - 50;
        
        star.style.animation = `starLaunch ${duration}s ease-out forwards`;
        star.style.setProperty('--move-x', `${moveX}px`);
        star.style.setProperty('--move-y', `${moveY}px`);
        
        document.body.appendChild(star);
        
        // Remove star after animation
        setTimeout(() => {
            if (star.parentNode) {
                star.remove();
            }
        }, duration * 1000);
    }
}

// Add CSS for star animation
const starStyle = document.createElement('style');
starStyle.textContent = `
    @keyframes starLaunch {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--move-x), var(--move-y)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(starStyle);

// Rocket launch sound effect
function playLaunchSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.8);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
        
        setTimeout(() => {
            try {
                const explosionOsc = audioContext.createOscillator();
                const explosionGain = audioContext.createGain();
                
                explosionOsc.connect(explosionGain);
                explosionGain.connect(audioContext.destination);
                
                explosionOsc.frequency.setValueAtTime(300, audioContext.currentTime);
                explosionOsc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                
                explosionGain.gain.setValueAtTime(0.08, audioContext.currentTime);
                explosionGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                explosionOsc.start();
                explosionOsc.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                // Ignore explosion sound error
            }
        }, 1200);
    } catch (e) {
        console.log("Audio context not supported - continuing without sound");
    }
}

// Rocket launch animation and scroll to top
if (goToTopBtn) {
    goToTopBtn.addEventListener('click', function() {
        if (goToTopBtn.classList.contains('launching')) return;
        
        const rocketRect = goToTopBtn.getBoundingClientRect();
        const rocketCenterX = rocketRect.left + rocketRect.width / 2;
        const rocketCenterY = rocketRect.top + rocketRect.height / 2;
        
        createStarParticles(rocketCenterX, rocketCenterY, 12);
        goToTopBtn.classList.add('launching');
        playLaunchSound();
        
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 400);
        
        setTimeout(() => {
            goToTopBtn.classList.remove('launching');
            goToTopBtn.classList.remove('visible');
            
            setTimeout(() => {
                if (window.scrollY > 300) {
                    goToTopBtn.classList.add('visible');
                }
            }, 500);
        }, 1500);
    });
}

// ============================================
// WHATSAPP BUTTON ANIMATION
// ============================================

const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    setTimeout(() => {
        whatsappBtn.style.opacity = '0';
        whatsappBtn.style.transform = 'translateY(20px)';
        whatsappBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            whatsappBtn.style.opacity = '1';
            whatsappBtn.style.transform = 'translateY(0)';
        }, 100);
    }, 1000);
}

// ============================================
// NAVBAR BACKGROUND ON SCROLL
// ============================================

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow');
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.classList.remove('shadow');
            navbar.style.backdropFilter = 'none';
            navbar.style.backgroundColor = 'white';
        }
    }
});

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize language
    initLanguage();
    
    // Initialize animations
    const demoItems = document.querySelectorAll('.demo-item');
    demoItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in-up');
        }, index * 100);
    });
});