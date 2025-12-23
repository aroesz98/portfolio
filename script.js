// ===========================
// Mobile Menu Toggle
// ===========================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = menuToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===========================
// Typing Animation Effect
// ===========================
const typedTextSpan = document.getElementById('typed-text');
const texts = [
    'Passionate about creating efficient, low-level software solutions',
    'Building Real-Time Operating Systems',
    'Optimizing embedded applications',
    'Creating hardware abstraction layers'
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
    const currentText = texts[textIndex];
    
    if (!isDeleting) {
        typedTextSpan.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause before deleting
        } else {
            typingSpeed = 100;
        }
    } else {
        typedTextSpan.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
        
        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Pause before typing next text
        }
    }
    
    setTimeout(typeText, typingSpeed);
}

// Start typing animation
setTimeout(typeText, 1000);

// ===========================
// Fetch GitHub Stats and Repos Combined
// ===========================
async function fetchGitHubData() {
    const username = 'aroesz98';
    
    try {
        // Fetch user data and repos in parallel
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
        ]);
        
        const userData = await userResponse.json();
        const repos = await reposResponse.json();
        
        console.log(`Fetched user data and ${repos.length} repositories`);
        
        // Calculate total lines of code
        let totalLines = 0;
        const languagePromises = repos.slice(0, 30).map(repo => 
            fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`)
                .then(res => res.json())
                .catch(() => ({}))
        );
        
        const languagesData = await Promise.all(languagePromises);
        languagesData.forEach(languages => {
            Object.values(languages).forEach(lines => {
                totalLines += lines;
            });
        });
        
        // Convert bytes to approximate lines
        const approximateLines = Math.floor(totalLines / 50);
        
        let roundedLines;
        if (approximateLines >= 10000) {
            roundedLines = Math.floor(approximateLines / 1000) * 1000;
        } else if (approximateLines >= 1000) {
            roundedLines = Math.floor(approximateLines / 100) * 100;
        } else {
            roundedLines = approximateLines || 1000;
        }
        
        const completedProjects = repos.filter(repo => !repo.fork).length;
        const createdDate = new Date(userData.created_at);
        const yearsExperience = Math.max(1, new Date().getFullYear() - createdDate.getFullYear());
        
        console.log('GitHub Stats:', {
            completedProjects,
            linesOfCode: roundedLines,
            totalRepos: userData.public_repos,
            yearsExperience
        });
        
        // Update stats
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].setAttribute('data-target', completedProjects);
            statNumbers[1].setAttribute('data-target', roundedLines);
            statNumbers[2].setAttribute('data-target', userData.public_repos);
            statNumbers[3].setAttribute('data-target', yearsExperience);
        }
        
        // Display repositories
        displayRepositories(repos.slice(0, 6));
        
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        // Set default stats on error
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].setAttribute('data-target', 20);
            statNumbers[1].setAttribute('data-target', 100000);
            statNumbers[2].setAttribute('data-target', 20);
            statNumbers[3].setAttribute('data-target', 5);
        }
        
        // Show error message for repos
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.innerHTML = '<p>Unable to load repositories. Please visit <a href="https://github.com/aroesz98" target="_blank" style="color: var(--primary-color);">GitHub</a> directly.</p>';
        }
    }
}

function displayRepositories(repos) {
    const reposGrid = document.getElementById('repos-grid');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    if (!reposGrid) {
        console.error('repos-grid element not found');
        return;
    }
    
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!Array.isArray(repos) || repos.length === 0) {
        reposGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No repositories found.</p>';
        return;
    }
    
    repos.forEach((repo, index) => {
        const repoCard = document.createElement('a');
        repoCard.href = repo.html_url;
        repoCard.target = '_blank';
        repoCard.className = 'repo-card';
        repoCard.style.animationDelay = `${index * 0.1}s`;
        
        const languageColor = getLanguageColor(repo.language);
        
        repoCard.innerHTML = `
            <div class="repo-header">
                <span class="repo-icon">📦</span>
                <h3 class="repo-name">${repo.name}</h3>
            </div>
            <p class="repo-description">${repo.description || 'No description available'}</p>
            <div class="repo-stats">
                ${repo.language ? `
                    <span class="repo-stat">
                        <span class="language-dot" style="background-color: ${languageColor}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                <span class="repo-stat">⭐ ${repo.stargazers_count}</span>
                <span class="repo-stat">🔱 ${repo.forks_count}</span>
            </div>
        `;
        
        reposGrid.appendChild(repoCard);
    });
}

// ===========================
// Animated Counter for Stats
// ===========================
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    updateCounter();
}

// Observe stats section and fetch real data
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // First fetch real GitHub data, then animate
            fetchGitHubStats().then(() => {
                document.querySelectorAll('.stat-number').forEach(stat => {
                    animateCounter(stat);
                });
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ===========================
// Fetch GitHub Repositories
// ===========================
async function fetchGitHubRepos() {
    const username = 'aroesz98';
    const reposGrid = document.getElementById('repos-grid');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    if (!reposGrid) {
        console.error('repos-grid element not found');
        return;
    }
    
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }
        
        const repos = await response.json();
        
        console.log(`Fetched ${repos.length} repositories`);
        
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        if (!Array.isArray(repos) || repos.length === 0) {
            reposGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No repositories found.</p>';
            return;
        }
        
        repos.forEach((repo, index) => {
            const repoCard = document.createElement('a');
            repoCard.href = repo.html_url;
            repoCard.target = '_blank';
            repoCard.className = 'repo-card';
            repoCard.style.animationDelay = `${index * 0.1}s`;
            
            const languageColor = getLanguageColor(repo.language);
            
            repoCard.innerHTML = `
                <div class="repo-header">
                    <span class="repo-icon">📦</span>
                    <h3 class="repo-name">${repo.name}</h3>
                </div>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-stats">
                    ${repo.language ? `
                        <span class="repo-stat">
                            <span class="language-dot" style="background-color: ${languageColor}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    <span class="repo-stat">⭐ ${repo.stargazers_count}</span>
                    <span class="repo-stat">🔱 ${repo.forks_count}</span>
                </div>
            `;
            
            reposGrid.appendChild(repoCard);
        });
    } catch (error) {
        console.error('Error fetching repos:', error);
        if (loadingSpinner) {
            loadingSpinner.innerHTML = '<p>Unable to load repositories. Please visit <a href="https://github.com/aroesz98" target="_blank">GitHub</a> directly.</p>';
        }
        if (reposGrid) {
            reposGrid.innerHTML = '';
        }
    }
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'C': '#555555',
        'C++': '#f34b7d',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'TypeScript': '#2b7489',
        'Go': '#00ADD8',
        'Rust': '#dea584'
    };
    return colors[language] || '#8257e5';
}

// ===========================
// Active Navigation Link
// ===========================
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// ===========================
// Smooth Scroll for Links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// Navbar Scroll Effect
// ===========================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 0) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// ===========================
// Form Submission
// ===========================
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Basic validation
    if (name && email && message) {
        // Here you would typically send the data to a server
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    } else {
        alert('Please fill in all fields.');
    }
});

// ===========================
// Scroll Animations
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// ===========================
// Dynamic Year in Footer
// ===========================
const yearElement = document.querySelector('.footer p');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = `© ${currentYear} ModernSite. All rights reserved.`;
}

// ===========================
// Parallax Effect for Hero
// ===========================
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

console.log('Modern Website Template loaded successfully!');
