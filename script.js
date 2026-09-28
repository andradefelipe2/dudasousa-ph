const eventsContainer = document.getElementById('events-container');
const galleryContainer = document.getElementById('gallery-container');
const currentEventTitle = document.getElementById('current-event-title');
const loadingSpinner = document.getElementById('loading-spinner');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

let eventosData = [];

// 1. Inicializa o site carregando as configurações dos eventos
async function init() {
  try {
    const res = await fetch('eventos.json');
    eventosData = await res.json();
    
    renderEventsScroll();

    if (eventosData.length > 0) {
      selectEvent(eventosData[0]);
    }
  } catch (error) {
    console.error('Erro ao carregar lista de eventos:', error);
    currentEventTitle.textContent = 'Erro ao carregar projetos.';
  }
}

// 2. Renderiza a barra horizontal de eventos
function renderEventsScroll() {
  eventsContainer.innerHTML = '';

  eventosData.forEach((evento, index) => {
    const card = document.createElement('div');
    card.classList.add('event-card');
    if (index === 0) card.classList.add('active');
    card.dataset.id = evento.id;

    card.innerHTML = `
      <img src="${evento.capa}" alt="${evento.titulo}">
      <div class="card-overlay">
        <span>${evento.titulo}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.event-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectEvent(evento);
    });

    eventsContainer.appendChild(card);
  });
}

// 3. Busca e exibe as fotos da pasta do Google Drive via Serverless Function
async function selectEvent(evento) {
  currentEventTitle.textContent = evento.titulo;
  galleryContainer.innerHTML = '';
  loadingSpinner.style.display = 'block';

  try {
    // Chamada à API Serverless da Vercel
    const response = await fetch(`/api/galeria?folderId=${evento.driveFolderId}`);
    const data = await response.json();

    loadingSpinner.style.display = 'none';

    if (!data.files || data.files.length === 0) {
      galleryContainer.innerHTML = '<p style="color: var(--text-secondary);">Nenhuma foto encontrada para este projeto.</p>';
      return;
    }

    data.files.forEach(file => {
      // Link direto do renderizador de imagens do Google Drive
      const imgUrl = `https://lh3.googleusercontent.com/d/${file.id}`;

      const item = document.createElement('div');
      item.classList.add('gallery-item');
      item.innerHTML = `<img src="${imgUrl}" alt="${file.name}" loading="lazy">`;

      item.addEventListener('click', () => openLightbox(imgUrl));

      galleryContainer.appendChild(item);
    });
  } catch (error) {
    loadingSpinner.style.display = 'none';
    console.error('Erro ao carregar fotos do Drive:', error);
    galleryContainer.innerHTML = '<p style="color: var(--text-secondary);">Não foi possível carregar as fotos deste projeto no momento.</p>';
  }
}

// 4. Modal / Lightbox
function openLightbox(url) {
  lightboxImg.src = url;
  lightbox.classList.add('active');
}

lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

init();