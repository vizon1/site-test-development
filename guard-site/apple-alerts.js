// 1. Injeta o CSS diretamente no topo da página
const style = document.createElement('style');
style.innerHTML = `
#apple-modal-overlay {
    position: fixed !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    width: 100vw !important; height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.45) !important;
    backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
    z-index: 999999 !important;
    display: flex !important; justify-content: center !important; align-items: center !important;
    opacity: 0; visibility: hidden; transition: all 0.25s ease;
    margin: 0 !important; padding: 0 !important;
}
#apple-modal-overlay.active {
    opacity: 1; visibility: visible;
}
.apple-alert-box {
    background-color: rgba(30, 30, 30, 0.85) !important;
    backdrop-filter: blur(25px) saturate(200%) !important; -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 18px !important;
    width: 320px !important; max-width: 85% !important;
    text-align: center !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
    transform: scale(1.1); opacity: 0; transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex !important; flex-direction: column !important; overflow: hidden !important;
    box-sizing: border-box !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}
#apple-modal-overlay.active .apple-alert-box {
    transform: scale(1); opacity: 1;
}
.apple-alert-content { padding: 24px 20px !important; }
.apple-alert-title {
    margin: 0 0 8px 0 !important; font-size: 1.15rem !important;
    font-weight: 600 !important; color: #fff !important; letter-spacing: -0.3px !important;
}
.apple-alert-message {
    margin: 0 !important; font-size: 0.95rem !important;
    color: #d2d2d7 !important; line-height: 1.4 !important;
}
.apple-alert-buttons {
    display: flex !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.apple-alert-btn {
    flex: 1 !important; background: transparent !important; border: none !important;
    padding: 15px !important; font-size: 1.05rem !important; font-weight: 500 !important;
    color: #0a84ff !important; cursor: pointer !important; transition: background 0.2s !important;
    font-family: inherit !important; outline: none !important;
}
.apple-alert-btn:hover { background: rgba(255, 255, 255, 0.05) !important; }
.apple-alert-btn:active { background: rgba(255, 255, 255, 0.1) !important; }
.apple-alert-btn.cancel {
    color: #ff453a !important; font-weight: 400 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.apple-alert-btn.confirm { font-weight: 600 !important; }
`;
document.head.appendChild(style);

// 2. Sequestra os comandos Nativos
window.alert = function(message, title = "Aviso") {
    return new Promise((resolve) => {
        createAppleModal(message, title, false, resolve);
    });
};

window.confirm = function(message, title = "Confirmação") {
    return new Promise((resolve) => {
        createAppleModal(message, title, true, resolve);
    });
};

// --- FUNÇÃO PARA LIMPAR EMOJIS ---
function removerEmojis(texto) {
    if (!texto) return texto;
    // O modificador 'u' permite o uso das propriedades Unicode avançadas
    // Isso remove qualquer símbolo classificado como emoji e depois tira espaços duplos
    return String(texto)
        .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
        .trim();
}

// 3. Constrói o Modal
function createAppleModal(rawMessage, rawTitle, isConfirm, resolve) {
    // Aplica o filtro nos textos recebidos
    const message = removerEmojis(rawMessage);
    const title = removerEmojis(rawTitle);

    // Remove modal anterior se houver
    const existing = document.getElementById('apple-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'apple-modal-overlay';

    let buttonsHtml = '';
    if (isConfirm) {
        buttonsHtml = `
            <button class="apple-alert-btn cancel" id="apple-cancel-btn">Cancelar</button>
            <button class="apple-alert-btn confirm" id="apple-ok-btn">OK</button>
        `;
    } else {
        buttonsHtml = `
            <button class="apple-alert-btn confirm" id="apple-ok-btn" style="width: 100%;">OK</button>
        `;
    }

    overlay.innerHTML = `
        <div class="apple-alert-box">
            <div class="apple-alert-content">
                <h3 class="apple-alert-title">${title}</h3>
                <p class="apple-alert-message">${message}</p>
            </div>
            <div class="apple-alert-buttons">
                ${buttonsHtml}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Pequeno delay para a animação CSS funcionar
    setTimeout(() => overlay.classList.add('active'), 10);

    const closeAndResolve = (result) => {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
            resolve(result); // Devolve true ou false
        }, 250); 
    };

    document.getElementById('apple-ok-btn').addEventListener('click', () => closeAndResolve(true));
    
    if (isConfirm) {
        document.getElementById('apple-cancel-btn').addEventListener('click', () => closeAndResolve(false));
    }
}
