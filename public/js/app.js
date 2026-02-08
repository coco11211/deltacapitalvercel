import { initAmbient } from './modules/ambient.js';
import { initNarrative } from './modules/narrative.js';
import { initAssembly } from './modules/assembly.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Global Initializations ---
    const ambientCanvas = document.getElementById('ambient-canvas');
    if (ambientCanvas) {
        // Load Three.js and then initialize
        if (!window.THREE) {
            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            threeScript.onload = () => {
                 initAmbient(ambientCanvas);
            }
            document.head.appendChild(threeScript);
        } else {
            initAmbient(ambientCanvas);
        }
    }

    // --- Command Palette ---
    const commandPalette = document.getElementById('command-palette');
    const commandInput = document.getElementById('command-input');
    const commandList = document.getElementById('command-list');

    const pages = [
        { name: 'Philosophy', path: '/' },
        { name: 'Methodology', path: '/research.html' },
        { name: 'Risk & Controls', path: '/risk.html' },
        { name: 'System Architecture', path: '/architecture.html' },
        { name: 'Disclosures', path: '/disclosures.html' },
        { name: 'Contact', path: '/contact.html' },
    ];

    function renderCommands(filter = '') {
        if (!commandList) return;
        commandList.innerHTML = '';
        const filteredPages = pages.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
        filteredPages.forEach((page, index) => {
            const li = document.createElement('li');
            li.textContent = page.name;
            li.dataset.path = page.path;
            if (index === 0) {
                li.classList.add('selected');
            }
            li.addEventListener('click', () => {
                window.location.href = page.path;
            });
            commandList.appendChild(li);
        });
    }

    function toggleCommandPalette(show) {
        if (!commandPalette) return;
        if (show) {
            commandPalette.classList.add('visible');
            commandInput.focus();
            renderCommands();
        } else {
            commandPalette.classList.remove('visible');
            commandInput.value = '';
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            toggleCommandPalette(true);
        }
        if (e.key === 'Escape') {
            toggleCommandPalette(false);
        }
        if(commandPalette.classList.contains('visible')){
            handlePaletteKeydown(e);
        }
    });
    
    commandInput && commandInput.addEventListener('input', () => renderCommands(commandInput.value));
    
    function handlePaletteKeydown(e) {
        const items = commandList.querySelectorAll('li');
        if (items.length === 0) return;
        
        let selected = commandList.querySelector('.selected');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            let next = selected.nextElementSibling || items[0];
            selected.classList.remove('selected');
            next.classList.add('selected');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            let prev = selected.previousElementSibling || items[items.length - 1];
            selected.classList.remove('selected');
            prev.classList.add('selected');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            window.location.href = selected.dataset.path;
        }
    }

    // --- Scroll Orchestration (Section Reveals) ---
    const sections = document.querySelectorAll('.section');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Page-Specific Initializations ---
    // Research Page - Narrative Object
    const narrativeContainer = document.getElementById('narrative-container');
    const narrativeCanvas = document.getElementById('narrative-canvas');
    if (narrativeCanvas && narrativeContainer) {
        if (!window.THREE) {
             const threeScript = document.createElement('script');
            threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            threeScript.onload = () => {
                initNarrative(narrativeCanvas, narrativeContainer);
            }
            document.head.appendChild(threeScript);
        } else {
             initNarrative(narrativeCanvas, narrativeContainer);
        }
    }

    // Architecture Page - Assembly Visualization
    const assemblyCanvas = document.getElementById('assembly-canvas');
    const assemblyTriggers = document.querySelectorAll('[data-trigger-phase]');
    if (assemblyCanvas && assemblyTriggers.length > 0) {
        const loadAssembly = () => initAssembly(assemblyCanvas, Array.from(assemblyTriggers));
        
        if (!window.THREE) {
            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            threeScript.onload = loadAssembly;
            document.head.appendChild(threeScript);
        } else {
            loadAssembly();
        }
    }

});
