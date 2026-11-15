import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { projects } from '../assets/js/data/projects.js';
import { skillRows } from '../assets/js/data/skills.js';
import { projectDetails, projectSlug } from '../assets/js/data/project-details.js';
import { aboutProfilePhotos } from '../assets/js/data/profile.js';
import { createPreviewServer } from './serve.mjs';
import { checkNavigation } from './navigation-smoke.mjs';
import { checkDock } from './dock-smoke.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagePaths = new Set(['/','/index.html','/home','/projects','/about', ...projects.map(project => `/project/${projectSlug(project)}`)]);
const localAsset = path => resolve(root, `.${decodeURIComponent(new URL(path, 'http://localhost/').pathname)}`);
const html = await readFile(resolve(root, 'index.html'), 'utf8');
assert(!/<style\b|\sstyle=|\son\w+=/i.test(html), 'HTML masih berisi inline style atau event handler');
assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), 'HTML masih berisi inline script');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Ada ID HTML duplikat');
for (const match of html.matchAll(/<a\b[^>]*>/g)) {
  const page = match[0].match(/\bdata-page="([^"]+)"/)?.[1];
  if (!page) continue;
  const href = match[0].match(/\bhref="([^"]+)"/)?.[1];
  assert.equal(href, `/${page}`, `Navigasi ${page} harus memakai URL /${page}`);
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  assert(/\s(?:src|srcset)="[^"]+"/.test(match[0]), 'Elemen img harus memiliki src atau srcset');
}
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const path = match[1];
  if (/^(?:https?:|data:|mailto:|#)/.test(path)) continue;
  if (pagePaths.has(path)) continue;
  assert(path.startsWith('/assets/'), `Aset harus memakai jalur root /assets/: ${path}`);
  await access(localAsset(path));
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(resolve(directory, entry.name)) : resolve(directory, entry.name)))).flat();
}

const jsFiles = (await walk(resolve(root, 'assets/js'))).filter(path => path.endsWith('.js'));
const activeModules = new Set();
async function followImports(file) {
  if (activeModules.has(file)) return;
  activeModules.add(file);
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    await followImports(resolve(dirname(file), match[1]));
  }
}
await followImports(resolve(root, 'assets/js/app.js'));
for (const file of jsFiles) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    await access(resolve(dirname(file), match[1]));
  }
  for (const match of source.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)) {
    if (activeModules.has(file)) assert(ids.includes(match[1]), `Elemen #${match[1]} tidak ada di HTML`);
  }
}

const cssFiles = (await walk(resolve(root, 'assets/css'))).filter(path => path.endsWith('.css'));
for (const file of cssFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)) {
    await access(resolve(dirname(file), match[1]));
  }
}

for (const project of projects) {
  assert(project.name && project.title && project.description && Array.isArray(project.tags));
  assert(project.cover.startsWith('/assets/'), 'Cover proyek harus memakai jalur root');
  await access(localAsset(project.cover));
}
for (const photo of aboutProfilePhotos) {
  assert(photo.src.startsWith('/assets/'), 'Foto About harus memakai jalur root');
  await access(localAsset(photo.src));
}
assert(skillRows.every(row => row.length && row.every(skill => skill.name && skill.icon)));
for (const skill of skillRows.flat()) {
  if (!skill.image) continue;
  assert(skill.image.startsWith('/assets/'), 'Logo skill harus memakai jalur root');
  await access(localAsset(skill.image));
}
assert.equal(projectDetails.length, projects.length, 'Jumlah detail tidak sesuai proyek');
assert.equal(new Set(projects.map(projectSlug)).size, projects.length, 'Slug proyek harus unik');
for (const [index, project] of projects.entries()) {
  const details = projectDetails[index];
  assert(details.problem && details.approach && details.highlights.length, `Detail proyek ${project.name} belum lengkap`);
  for (const image of [project.cover, ...(details.gallery ?? project.images)]) {
    assert(image.startsWith('/assets/'), 'Gambar galeri harus memakai jalur root');
    await access(localAsset(image));
  }
}
for (const match of html.matchAll(/<a\b[^>]*data-project="(\d+)"[^>]*>/g)) {
  const project = projects[Number(match[1])];
  assert(project, 'Indeks proyek tidak valid');
  assert(match[0].includes(`/project/${projectSlug(project)}`), 'Tautan proyek tidak sesuai slug');
}

const server = createPreviewServer();
const redirects = await readFile(resolve(root, '_redirects'), 'utf8');
const hosting = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
for (const path of ['/home', '/projects', '/about']) {
  assert(redirects.split(/\r?\n/).some(line => line.trim() === `${path} /index.html 200`), `Rewrite Cloudflare tidak tersedia untuk ${path}`);
  assert(hosting.rewrites.some(rule => rule.source === path && rule.destination === '/index.html'), `Rewrite Vercel tidak tersedia untuk ${path}`);
}
assert(redirects.includes('/project/* /index.html 200'));
assert(hosting.rewrites.some(rule => rule.source === '/project/:slug' && rule.destination === '/index.html'));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const [path, type] of [['/', 'text/html'], ['/home', 'text/html'], ['/projects', 'text/html'], ['/about', 'text/html'], ...projects.map(project => [`/project/${projectSlug(project)}`, 'text/html']), ['/assets/js/app.js', 'text/javascript'], ['/assets/css/main.css', 'text/css'], ['/assets/img/Delshop%20Home.png', 'image/png']]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, `HTTP gagal untuk ${path}`);
    assert(response.headers.get('content-type').startsWith(type), `MIME tidak sesuai untuk ${path}`);
    await response.arrayBuffer();
  }
  for (const path of ['/.git/config', '/package.json', '/assets/../README.md', '/assets/missing.png', '/not-a-page', '/project/example/extra']) {
    assert.equal((await fetch(base + path)).status, 404, `Akses tidak sesuai untuk ${path}`);
  }
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}

let missingGallery = 0;
await checkNavigation();
await checkDock();
for (const project of projects) {
  for (const image of project.images) {
    try { await access(localAsset(image)); }
    catch { missingGallery++; }
  }
}
console.log(`OK: ${jsFiles.length} modul JS, ${cssFiles.length} file CSS, ${projects.length} proyek, ${skillRows.flat().length} skill; struktur, import, syntax, dan server HTTP valid.`);
if (missingGallery) console.log(`${missingGallery} jalur gambar lama belum tersedia; galeri detail menggunakan aset yang tersedia.`);
