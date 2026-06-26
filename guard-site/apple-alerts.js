// apple-alerts.js

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

function createAppleModal(message, title, isConfirm, resolve) {
    // Remove modal anterior se houver
    const existing = document.getElementById('apple-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'apple-modal-overlay';
    overlay.className = 'apple-alert-overlay';

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
            overlay.remove();
            resolve(result); // Devolve true ou false
        }, 250); 
    };

    document.getElementById('apple-ok-btn').addEventListener('click', () => closeAndResolve(true));
    
    if (isConfirm) {
        document.getElementById('apple-cancel-btn').addEventListener('click', () => closeAndResolve(false));
    }
}
