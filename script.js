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
const githubUsername = 'aroesz98';
const githubCacheKey = 'portfolioGithubData';
const githubCacheMaxAge = 1000 * 60 * 60 * 24;
const fallbackStats = {
    completedProjects: 24,
    linesOfCode: 370000,
    totalRepos: 24,
    yearsExperience: 5
};
const fallbackRepositories = [
    {
        name: 'STM32-based-High-Power-Boost-Converter',
        description: 'STM32-based high power boost converter project',
        html_url: 'https://github.com/aroesz98/STM32-based-High-Power-Boost-Converter',
        language: 'C',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'SimpleFSM',
        description: 'Simple finite state machine implementation',
        html_url: 'https://github.com/aroesz98/SimpleFSM',
        language: 'C++',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'portfolio',
        description: 'Personal portfolio website',
        html_url: 'https://github.com/aroesz98/portfolio',
        language: 'JavaScript',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'PSXE_ReARMed',
        description: 'PSX Emulator for ARM Cortex-M',
        html_url: 'https://github.com/aroesz98/PSXE_ReARMed',
        language: 'C',
        stargazers_count: 0,
        forks_count: 0
    },
    {
        name: 'CRTOS',
        description: 'Custom Real-Time Operating System for ARM Cortex-M',
        html_url: 'https://github.com/aroesz98/CRTOS',
        language: 'C++',
        stargazers_count: 1,
        forks_count: 0
    },
    {
        name: 'Memory-Operations-ARM-CM4-CM7',
        description: 'ARM Cortex M4/M7 optimized memory operations',
        html_url: 'https://github.com/aroesz98/Memory-Operations-ARM-CM4-CM7',
        language: 'Assembly',
        stargazers_count: 1,
        forks_count: 0
    }
];

function readCachedGitHubData() {
    try {
        const cachedData = JSON.parse(localStorage.getItem(githubCacheKey));
        if (cachedData && Date.now() - cachedData.updatedAt < githubCacheMaxAge) {
            return cachedData;
        }
    } catch (error) {
        console.warn('Unable to read cached GitHub data:', error);
    }

    return null;
}

function writeCachedGitHubData(stats, repositories) {
    try {
        localStorage.setItem(githubCacheKey, JSON.stringify({
            stats,
            repositories,
            updatedAt: Date.now()
        }));
    } catch (error) {
        console.warn('Unable to cache GitHub data:', error);
    }
}

async function fetchGitHubData() {
    const cachedData = readCachedGitHubData();

    if (cachedData) {
        updateStats(cachedData.stats);
        displayRepositories(cachedData.repositories);
    } else {
        updateStats(fallbackStats);
        displayRepositories(fallbackRepositories);
    }
    
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${githubUsername}`, {
                headers: { Accept: 'application/vnd.github+json' }
            }),
            fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`, {
                headers: { Accept: 'application/vnd.github+json' }
            })
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error(`GitHub API request failed: user ${userResponse.status}, repos ${reposResponse.status}`);
        }
        
        const userData = await userResponse.json();
        const repos = await reposResponse.json();

        if (!Array.isArray(repos)) {
            throw new Error('GitHub repositories response was not an array');
        }
        
        console.log(`Fetched user data and ${repos.length} repositories`);

        const completedProjects = repos.filter(repo => !repo.fork).length;
        const createdDate = new Date(userData.created_at);
        const yearsExperience = Math.max(1, new Date().getFullYear() - createdDate.getFullYear());
        const stats = {
            completedProjects,
            linesOfCode: fallbackStats.linesOfCode,
            totalRepos: userData.public_repos,
            yearsExperience
        };
        const latestRepositories = repos.slice(0, 6);
        
        console.log('GitHub Stats:', {
            completedProjects,
            linesOfCode: stats.linesOfCode,
            totalRepos: userData.public_repos,
            yearsExperience
        });
        
        updateStats(stats);
        displayRepositories(latestRepositories);
        writeCachedGitHubData(stats, latestRepositories);
        
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }
}

let githubDataPromise;

function loadGitHubData() {
    if (!githubDataPromise) {
        githubDataPromise = fetchGitHubData();
    }

    return githubDataPromise;
}

function updateStats(stats) {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statValues = [
        stats.completedProjects,
        stats.linesOfCode,
        stats.totalRepos,
        stats.yearsExperience
    ];

    if (statNumbers.length >= 4) {
        statValues.forEach((value, index) => {
            statNumbers[index].setAttribute('data-target', value);
            statNumbers[index].textContent = value.toLocaleString();
        });
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
    
    reposGrid.innerHTML = '';

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
            loadGitHubData().then(() => {
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

loadGitHubData();

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
const contactEmail = 'arkadiusz.szlanta@vp.pl';

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name && email && message) {
        const subject = `Portfolio contact from ${name}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            message
        ].join('\n');

        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

console.log('Portfolio script loaded successfully!');
