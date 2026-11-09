// ============================================
// ONBOX - AI Movie Generator Page
// ============================================

const AIPage = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const btn = document.getElementById('ai-generate-btn');
        const input = document.getElementById('ai-prompt');
        if (btn) {
            btn.addEventListener('click', () => {
                const prompt = input ? input.value.trim() : '';
                if (!prompt) {
                    UI.showToast('Please enter a prompt first', 'warning');
                    if (input) input.focus();
                    return;
                }
                UI.showToast('AI Movie Generator is coming soon! Stay tuned.', 'info', 4000);
            });
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    btn?.click();
                }
            });
        }
    }
};

window.AIPage = AIPage;
