const cardsGrid = document.getElementById('cardsGrid');
const loading = document.getElementById('loading');
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
    
    return card;
}

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