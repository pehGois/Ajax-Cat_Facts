const cardsGrid = document.getElementById('cardsGrid');
const loading = document.getElementById('loading');
const catModal = document.getElementById('catModal');
const closeModal = document.getElementById('closeModal');
const catImage = document.getElementById('catImage');
const modalLoading = document.getElementById('modalLoading');
const modalError = document.getElementById('modalError');

let isLoading = false;
let currentPage = 1;
let hasMorePages = true;

const catEmojis = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐈', '🐈‍⬛'];

function getRandomCatEmoji() {
    return catEmojis[Math.floor(Math.random() * catEmojis.length)];
}

function createCard(fact) {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
        <div class="fact-text">${fact}</div>
        <hr class="divider">
        <div class="cat-emoji">${getRandomCatEmoji()}</div>
    `;
    
    // Adiciona evento de clique no card
    card.addEventListener('click', () => openModal());
    
    return card;
}

function openModal() {
    catModal.style.display = 'flex';
    catImage.style.display = 'none';
    modalLoading.style.display = 'block';
    modalError.style.display = 'none';
    
    // Faz a requisição assíncrona para a Cat API
    loadCatImage();
}

function loadCatImage() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.thecatapi.com/v1/images/search', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response && response.length > 0 && response[0].url) {
                    catImage.src = response[0].url;
                    catImage.onload = function() {
                        modalLoading.style.display = 'none';
                        catImage.style.display = 'block';
                    };
                    catImage.onerror = function() {
                        showModalError();
                    };
                } else {
                    showModalError();
                }
            } catch (e) {
                console.error('Erro ao processar imagem:', e);
                showModalError();
            }
        } else {
            showModalError();
        }
    };
    
    xhr.onerror = function() {
        showModalError();
    };
    
    xhr.send();
}

function showModalError() {
    modalLoading.style.display = 'none';
    catImage.style.display = 'none';
    modalError.style.display = 'block';
}

function closeModalWindow() {
    catModal.style.display = 'none';
    catImage.src = '';
}

// Event listeners para fechar o modal
closeModal.addEventListener('click', closeModalWindow);

catModal.addEventListener('click', (e) => {
    if (e.target === catModal) {
        closeModalWindow();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && catModal.style.display === 'flex') {
        closeModalWindow();
    }
});

function loadCatFacts() {
    if (isLoading || !hasMorePages) return;
    
    isLoading = true;
    loading.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://catfact.ninja/facts?page=${currentPage}&limit=12`, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.data && Array.isArray(response.data)) {
                    response.data.forEach(factObj => {
                        const card = createCard(factObj.fact);
                        cardsGrid.appendChild(card);
                    });
                    
                    // Verifica se há mais páginas
                    if (response.next_page_url) {
                        currentPage++;
                    } else {
                        hasMorePages = false;
                    }
                }
            } catch (e) {
                console.error('Erro ao processar dados:', e);
                showError('Erro ao carregar fatos sobre gatos');
            }
        } else {
            showError('Erro ao carregar dados da API');
        }
        
        isLoading = false;
        loading.style.display = 'none';
    };
    
    xhr.onerror = function() {
        showError('Erro de conexão com a API');
        isLoading = false;
        loading.style.display = 'none';
    };
    
    xhr.send();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    cardsGrid.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 500 && !isLoading && hasMorePages) {
        loadCatFacts();
    }
}

window.addEventListener('scroll', handleScroll);

// Carregar a primeira página ao iniciar
loadCatFacts();