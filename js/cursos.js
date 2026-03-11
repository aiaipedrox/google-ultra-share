// Dados mocados dos modulos
const modulesData = {
    'veo3': {
        title: "Dominando o Veo 3",
        desc: "Aprenda a criar imagens e videos fotorrealistas e cinematograficos usando o maximo do motor de inteligencia artificial Veo 3 do Google Ultra.",
        lessons: [
            { id: 1, title: "Introdução ao Veo 3", duration: "12:40", thumb: "img/flow-3d.png" },
            { id: 2, title: "Prompts Cinematográficos Infalíveis", duration: "25:15", thumb: "img/flow-3d.png" },
            { id: 3, title: "Consistencia de Personagem", duration: "18:30", thumb: "img/flow-3d.png" },
            { id: 4, title: "Animando Fotos Estaticas", duration: "14:20", thumb: "img/flow-3d.png" }
        ]
    },
    'flow': {
        title: "Google Flow Essencial",
        desc: "Crie automações, workflows e agentes integrados em minutos. Aprenda a conectar as ferramentas do Workspace com a API do Gemini.",
        lessons: [
            { id: 1, title: "O que é o Google Flow?", duration: "08:15", thumb: "img/checkout-banner.png" },
            { id: 2, title: "Primeira Automação na Prática", duration: "19:50", thumb: "img/checkout-banner.png" },
            { id: 3, title: "Integrando Sheets e Gmail", duration: "22:10", thumb: "img/checkout-banner.png" }
        ]
    },
    'nano': {
        title: "Segredos Nano Banana",
        desc: "Domine o DarkPlanner V8 e a metodologia Nano Banana para organizar, delegar e escalar seus resultados no digital.",
        lessons: [
            { id: 1, title: "O conceito Nano Banana", duration: "15:00", thumb: "img/bannerrateios.png" },
            { id: 2, title: "Configurando o DarkPlanner V8", duration: "32:45", thumb: "img/bannerrateios.png" },
            { id: 3, title: "Como ter Controle Total", duration: "28:10", thumb: "img/bannerrateios.png" },
            { id: 4, title: "Escale seus Lançamentos", duration: "45:00", thumb: "img/bannerrateios.png" },
            { id: 5, title: "Aula Bônus: Hacks Secretos", duration: "19:20", thumb: "img/bannerrateios.png" }
        ]
    }
};

// Funcao para carregar o modulo selecionado
function loadModule(moduleId) {
    // Update active visual state
    document.querySelectorAll('.module-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.module-item[onclick="loadModule('${moduleId}')"]`).classList.add('active');

    const module = modulesData[moduleId];
    
    // Update header info
    document.getElementById('course-title').textContent = module.title;
    document.getElementById('course-desc').textContent = module.desc;

    // Reset player to placeholder
    document.getElementById('video-player').innerHTML = `
        <div class="video-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--blue)">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <p id="current-video-title" style="margin-top: 16px; font-weight: 500; color: #E8EAED;">Selecione uma aula abaixo para começar</p>
        </div>
    `;

    // Render lessons grid
    const lessonsGrid = document.getElementById('lessons-grid');
    lessonsGrid.innerHTML = ''; // clear

    module.lessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.onclick = () => playLesson(lesson, card);
        card.innerHTML = `
            <div class="lesson-thumb">
                <img src="${lesson.thumb}" alt="${lesson.title}">
                <div class="play-overlay">
                    <div class="play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <span class="lesson-duration">${lesson.duration}</span>
            </div>
            <div class="lesson-info">
                <span class="lesson-number">Aula ${index + 1}</span>
                <h4 class="lesson-title">${lesson.title}</h4>
            </div>
        `;
        lessonsGrid.appendChild(card);
    });
}

function playLesson(lesson, cardElement) {
    // Update visual active card
    document.querySelectorAll('.lesson-card').forEach(el => el.classList.remove('active'));
    cardElement.classList.add('active');

    // Emula um player carregando... na produção, inseriríamos um iframe (YouTube/Vimeo) aqui.
    document.getElementById('video-player').innerHTML = `
        <div class="video-placeholder" style="background: #000;">
            <svg class="animate-pulse" width="64" height="64" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <p style="margin-top: 24px; font-weight: 600; color: white;">Carregando vídeo: ${lesson.title}...</p>
            <p style="margin-top: 8px; font-size: 0.9rem; color: #9AA0A6;">(Integração do player de vídeo acontecerá aqui)</p>
        </div>
    `;

    // Scroll map the player securely
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Inicializar primeiro modulo ao carregar pag
document.addEventListener('DOMContentLoaded', () => {
    loadModule('veo3');
});
