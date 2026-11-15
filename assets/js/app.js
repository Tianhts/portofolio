import { renderProjects } from './components/projects.js';
import { renderSkills } from './components/skills.js';
import { initNavigation } from './features/navigation.js';
import { initProjectDetail } from './features/project-detail.js';
import { initTheme } from './features/theme.js';
import { initSpotify } from './features/spotify.js';
import { initCursor } from './animations/cursor.js';
import { initTypewriter } from './animations/typewriter.js';
import { initIntro } from './animations/intro.js';
import { initDock } from './animations/dock.js';
import { observeReveals } from './animations/reveal.js';
import { initInteractions } from './animations/interactions.js';

// Module scripts run after HTML parsing. Render before attaching feature behavior.
renderProjects();
renderSkills();
initProjectDetail();
initNavigation();
initIntro();
initDock();
initTheme();
initSpotify();
initInteractions();
initCursor();
initTypewriter();
observeReveals();

const year = document.getElementById('footer-year');
if (year) year.textContent = String(new Date().getFullYear());
