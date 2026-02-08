import { initAmbient } from './modules/ambient.js';
import { initNarrative } from './modules/narrative.js';
import { initScroll } from './modules/scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    initAmbient(document.getElementById('ambient-canvas'));
    initNarrative(document.getElementById('narrative-canvas'));
    initScroll();

    // Command Palette
    const commandPalette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandList = document.getElementById('command-list');

    const pages = [
        { name: 'Philosophy', url: '/' },
        { name: 'Research', url: './research.html' },
        { name: 'Risk', url: './risk.html' },
        { name: 'Architecture', url: './architecture.html' },
        { name: 'Disclosures', url: './disclosures.html' },
        { name: 'Contact', url: './contact.html' },
    ];

    function openPalette() {
        commandPalette.style.display = 'flex';
        commandInput.focus();
        renderList('');
    }

    function closePalette() {
        commandPalette.style.display = 'none';
    }

    function renderList(filter) {
        commandList.innerHTML = '';
        pages
            .filter(page => page.name.toLowerCase().includes(filter.toLowerCase()))
            .forEach(page => {
                const li = document.createElement('li');
                li.textContent = page.name;
                li.onclick = () => {
                    window.location.href = page.url;
                };
                commandList.appendChild(li);
            });
    }

    commandInput.addEventListener('input', (e) => renderList(e.target.value));

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
        }
        if (e.key === 'Escape') {
            closePalette();
        }
    });

    commandPalette.addEventListener('click', (e) => {
        if (e.target === commandPalette) {
            closePalette();
        }
    });
});
