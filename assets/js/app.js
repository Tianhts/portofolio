import { renderProjects } from './components/projects.js';
import { renderSkills } from './components/skills.js';
import { initNavigation } from './features/navigation.js';
import { initModal } from './features/modal.js';
import { initTheme } from './features/theme.js';
import { initSpotify } from './features/spotify.js';
import { initCursor } from './animations/cursor.js';
import { initParticles } from './animations/particles.js';
import { initTypewriter } from './animations/typewriter.js';
import { observeReveals } from './animations/reveal.js';
import { initInteractions } from './animations/interactions.js';

// Module scripts run after HTML parsing. Render before attaching feature behavior.
renderProjects();
renderSkills();
initNavigation();
initModal();
initTheme();
initSpotify();
initInteractions();
initCursor();
initParticles();
initTypewriter();
observeReveals();
