// Load Data
let currentNews = [];
let newsLoaded = false;
const newsListeners = [];

function onNewsUpdate(callback) {
    newsListeners.push(callback);
    if (newsLoaded) callback(currentNews);
}

// Kept for backward compatibility with synchronous calls if any (returns empty or cached)
function getNews() {
    return currentNews;
}

function saveNews(newsItem) {
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        alert("Firebase non configuré. Impossible de sauvegarder.");
        return;
    }

    // Create a new ref/key
    const newRef = firebase.database().ref('news').push();
    // Assign that key as the ID
    newsItem.id = newRef.key;

    newRef.set(newsItem).then(() => {
        // Reload or just close modal? Listener should update UI
        closeModal('post-modal');
        // If on news page or home page, UI updates via listener
    }).catch(error => {
        console.error("Error saving news:", error);
        alert("Erreur lors de la sauvegarde: " + error.message);
    });
}

function getRegion(id) {
    return REGIONS.find(r => r.id === id);
}

// Auth State
const AUTH_KEY = 'ifl_auth_user'; // Changed key to store username
const USERS = {
    'Professeur': 'ProfFRLIT2026',
    'IFL': 'InstitutFR2026'
};

function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

function getCurrentUser() {
    return localStorage.getItem(AUTH_KEY);
}

function login(user, pass) {
    if (USERS[user] && USERS[user] === pass) {
        localStorage.setItem(AUTH_KEY, user);
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
}

// UI Components
function renderHeader() {
    const isAuth = isLoggedIn();
    const authBtnText = isAuth ? 'Déconnexion' : 'Connexion';
    const authBtnAction = isAuth ? 'onclick="logout()"' : 'onclick="openModal(\'login-modal\')"';
    const postBtn = isAuth ? '<button onclick="openPostModal()" class="btn btn-primary" style="margin-right: 10px;">Publier</button>' : '';

    const headerHTML = `
    <div class="container nav-container">
        <a href="index.html" class="logo" style="display: flex; align-items: center; text-decoration: none;">
            <img src="Logo.png" alt="Plateforme France-Lituanie" style="height: 50px; margin-right: 15px;">
            <div>
                <div style="font-weight: bold; font-size: 1.2rem;">Plateforme</div>
                <div style="font-size: 0.8rem; font-weight: 400;">France - Lituanie</div>
            </div>
        </a>
        <nav class="nav-links">
            <a href="index.html">Accueil</a>
            <a href="news.html">Actualités</a>
            <a href="regions.html">Régions</a>
            <a href="guide.html">Guide des professeurs</a>
            ${postBtn}
            <button ${authBtnAction} class="btn btn-accent" style="padding: 5px 15px;">${authBtnText}</button>
        </nav>
    </div>`;
    document.querySelector('header').innerHTML = headerHTML;

    // Set active link
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (path.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

function renderFooter() {
    const footerHTML = `
    <div class="container">
        <div style="text-align: center; margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto;">
            <img src="logo-ifl.png" alt="Institut Français de Lituanie" style="height: 80px; margin-bottom: 1rem;">
            <p style="font-size: 0.95rem; line-height: 1.6;">
                Ce site est un outil proposé par l'Institut Français de Lituanie et mis à la disposition des établissements participant à un échange entre la France et la Lituanie. Les professeurs peuvent ainsi ajouter leur contenu sur la plateforme pour permettre aux élèves et aux familles de voir le résultat de leurs échanges.
            </p>
        </div>
        
        <div class="grid grid-cols-2 gap-4" style="text-align: center; margin-bottom: 2rem;">
            <div>
                <h3>Contact</h3>
                <p><a href="mailto:coralie.krener@diplomatie.gouv.fr" style="color: inherit;">coralie.krener@diplomatie.gouv.fr</a></p>
                <p><a href="mailto:olga.paleckiene@institutfrancais-lituanie.com" style="color: inherit;">olga.paleckiene@institutfrancais-lituanie.com</a></p>
            </div>
            <div>
                <h3>Liens Utiles</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><a href="https://www.institutfrancais-lituanie.com/" target="_blank" style="font-weight: bold;">Institut français de Lituanie</a></li>
                    <li><a href="guide.html">Guide des professeurs</a></li>
                    <li><a href="regions.html">Carte des régions</a></li>
                </ul>
            </div>
        </div>

        <div style="margin-top: 2rem; border-top: 1px solid #334155; padding-top: 1rem; text-align: center; font-size: 0.8rem; opacity: 0.7;">
            &copy; 2026 Plateforme Collaborative France-Lituanie.
        </div>
    </div>`;
    document.querySelector('footer').innerHTML = footerHTML;
}

function deleteNews(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    if (typeof firebase !== 'undefined') {
        firebase.database().ref('news/' + id).remove()
            .then(() => {
                console.log("Deleted");
                // UI updates via listener
            })
            .catch(err => alert(err));
    }
}

// Helper to render a news card
function createNewsCard(item) {
    let regionName;
    if (item.regionId === 'Institut Français') {
        regionName = 'Institut Français';
    } else {
        const region = getRegion(item.regionId);
        regionName = region ? region.name : 'France';
    }

    // Check auth for delete/edit buttons
    // Only IFL user can edit/delete "Institut Français" posts
    // Professeur can edit/delete others, but NOT "Institut Français"
    const user = getCurrentUser();
    const isAuth = isLoggedIn();
    const isIFL = user === 'IFL';
    const isRestricted = item.regionId === 'Institut Français';

    // Show buttons if logged in AND (post is not restricted OR user is IFL)
    // implying: if post is restricted, user MUST be IFL.
    const canEdit = isAuth && (!isRestricted || isIFL);

    const actionBtns = canEdit ?
        `<button onclick="deleteNews('${item.id}')" class="btn-delete" title="Supprimer">×</button>
         <button onclick="editNews('${item.id}')" class="btn-edit" title="Modifier" style="position: absolute; top: 10px; right: 40px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">✎</button>`
        : '';

    return `
    <div class="card" style="position: relative;">
        ${actionBtns}
        <div class="region-tag">${regionName}</div>
        <a href="news-detail.html?id=${item.id}" style="text-decoration: none; color: inherit;">
            <img src="${item.image}" alt="${item.title}">
            <div class="card-content">
                <span class="date">${new Date(item.date).toLocaleDateString('fr-FR')}</span>
                <h3>${item.title}</h3>
                <p>${item.content.substring(0, 100)}...</p>
            </div>
        </a>
    </div>`;
}

function openPostModal() {
    // Reset form for new post
    document.getElementById('post-form').reset();
    document.getElementById('post-id').value = '';

    // Reset date if exists
    const dateInput = document.getElementById('post-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    document.getElementById('post-modal').querySelector('h2').textContent = 'Publier une actualité';
    document.getElementById('post-submit-btn').textContent = 'Publier';
    openModal('post-modal');
}

function editNews(id) {
    const news = getNews();
    const item = news.find(n => n.id == id);
    if (!item) return;

    document.getElementById('post-id').value = item.id;
    document.getElementById('post-title').value = item.title;
    document.getElementById('post-content').value = item.content;
    document.getElementById('post-region').value = item.regionId;
    document.getElementById('post-image').value = item.image || '';

    // Populate date if exists
    const dateInput = document.getElementById('post-date');
    if (dateInput && item.date) {
        dateInput.value = item.date.split('T')[0];
    }

    document.getElementById('post-modal').querySelector('h2').textContent = 'Modifier l\'actualité';
    document.getElementById('post-submit-btn').textContent = 'Mettre à jour';

    openModal('post-modal');
}


// Modal Logic
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Modals Injection
function renderModals() {
    const user = getCurrentUser();
    const iflOption = user === 'IFL' ? '<option value="Institut Français">Institut Français</option>' : '';
    const dateField = user === 'IFL' ? `
        <div class="form-group">
            <label for="post-date">Date de publication</label>
            <input type="date" id="post-date" class="form-control">
        </div>` : '';

    const modalsHTML = `
    <!-- Login Modal -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal('login-modal')">&times;</span>
            <div class="modal-header">
                <h2>Connexion Professeur</h2>
            </div>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Identifiant</label>
                    <input type="text" id="username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Se connecter</button>
            </form>
        </div>
    </div>

    <!-- Post News Modal -->
    <div id="post-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal('post-modal')">&times;</span>
            <div class="modal-header">
                <h2>Publier une actualité</h2>
            </div>
            <form id="post-form">
                <input type="hidden" id="post-id">
                <div class="form-group">
                    <label for="post-title">Titre</label>
                    <input type="text" id="post-title" class="form-control" required>
                </div>
                ${dateField}
                <div class="form-group">
                    <label for="post-image">URL de l'image (optionnel)</label>
                    <input type="url" id="post-image" class="form-control" placeholder="https://exemple.com/image.jpg">
                </div>
                <div class="form-group">
                    <label for="post-region">Région</label>
                    <select id="post-region" class="form-control" required>
                        <option value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</option>
                        <option value="bourgogne-franche-comte">Bourgogne-Franche-Comté</option>
                        <option value="bretagne">Bretagne</option>
                        <option value="centre-val-de-loire">Centre-Val de Loire</option>
                        <option value="corse">Corse</option>
                        <option value="grand-est">Grand Est</option>
                        <option value="hauts-de-france">Hauts-de-France</option>
                        <option value="ile-de-france">Île-de-France</option>
                        <option value="normandie">Normandie</option>
                        <option value="nouvelle-aquitaine">Nouvelle-Aquitaine</option>
                        <option value="occitanie">Occitanie</option>
                        <option value="pays-de-la-loire">Pays de la Loire</option>
                        <option value="paca">Provence-Alpes-Côte d'Azur</option>
                        <option value="guadeloupe">Guadeloupe</option>
                        <option value="guyane">Guyane</option>
                        <option value="martinique">Martinique</option>
                        <option value="mayotte">Mayotte</option>
                        <option value="reunion">La Réunion</option>
                        ${iflOption}
                    </select>
                </div>
                <div class="form-group">
                    <label for="post-content">Contenu</label>
                    <textarea id="post-content" class="form-control" required></textarea>
                </div>
                <button type="submit" id="post-submit-btn" class="btn btn-primary" style="width: 100%;">Publier</button>
            </form>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalsHTML);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderModals(); // Inject modals first
    renderHeader();
    renderFooter();

    // Firebase Initialization and Listener
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        const database = firebase.database();
        const newsRef = database.ref('news');

        // Show loading state if grid exists
        const grid = document.getElementById('recent-news-grid');
        if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Chargement des actualités...</p>';

        newsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                currentNews = Object.keys(data).map(key => ({ ...data[key], id: key })); // Map key to id
                // Sort by date desc (newest first)
                currentNews.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else {
                currentNews = [];
                // Check if we should initialize data (optional)
                // If this is the *very first* run, maybe we want to push INITIAL_NEWS
                // But let's avoid auto-writing without explicit intent to avoid dupes on every empty load
            }
            newsLoaded = true;

            // Notify listeners
            newsListeners.forEach(cb => cb(currentNews));

            // Page specific logic for recent news (Home page)
            if (document.getElementById('recent-news-grid')) {
                const news = currentNews.slice(0, 3);
                const grid = document.getElementById('recent-news-grid');
                if (grid) {
                    if (news.length > 0) {
                        grid.innerHTML = news.map(createNewsCard).join('');
                    } else {
                        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucune actualité pour le moment.</p>';
                    }
                }
            }
        });
    } else {
        console.error("Firebase JS SDK not loaded or config missing");
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if (login(user, pass)) {
                window.location.reload();
            } else {
                alert('Identifiants incorrects');
            }
        });
    }

    // Post Form Handler
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('post-id').value;
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            const region = document.getElementById('post-region').value;
            const imageUrl = document.getElementById('post-image').value;

            // Use provided URL or fallback to random/placeholder
            const image = imageUrl ? imageUrl : 'https://picsum.photos/seed/' + Date.now() + '/400/250';

            const newsItem = {
                title: title,
                content: content,
                regionId: region,
                image: image,
                // If editing, keep original date, else new date
                date: (id && getNews().find(n => n.id == id)?.date) || new Date().toISOString()
            };

            // If IFL user provided a date, use it/override it
            const dateInput = document.getElementById('post-date');
            if (dateInput && dateInput.value) {
                newsItem.date = dateInput.value;
            }

            if (id) {
                // Edit existing
                if (typeof firebase !== 'undefined') {
                    firebase.database().ref('news/' + id).update(newsItem).then(() => {
                        closeModal('post-modal');
                    });
                }
            } else {
                // Create new
                saveNews(newsItem); // Uses firebase push
            }

            // No reload needed if listeners work, but close modal is essential
        });
    }

    // Close modals on outside click
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
});
