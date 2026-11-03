'use strict';

const config = window.SITE_CONFIG || {};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One continuous photograph, viewed through each of the hero cards.
const mosaic = document.querySelector('.mosaic');
const heroImage = new Image();
function positionMosaic() {
  if (!heroImage.naturalWidth) return;
  const bounds = mosaic.getBoundingClientRect();
  const scale = Math.max(bounds.width / heroImage.naturalWidth, bounds.height / heroImage.naturalHeight);
  const width = heroImage.naturalWidth * scale;
  const height = heroImage.naturalHeight * scale;
  const focal = window.matchMedia('(max-width: 767px)').matches ? 0.65 : 0.8;
  const offset = (width - bounds.width) * focal;
  mosaic.querySelectorAll('.mask-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    card.style.backgroundSize = `${width}px ${height}px`;
    card.style.backgroundPosition = `${-(rect.left - bounds.left + offset)}px ${-(rect.top - bounds.top)}px`;
  });
}
heroImage.addEventListener('load', positionMosaic);
heroImage.src = 'assets/images/workplace.jpg';
if ('ResizeObserver' in window) new ResizeObserver(positionMosaic).observe(mosaic);
else window.addEventListener('resize', positionMosaic);
document.fonts?.ready.then(positionMosaic);

// The introductory counter runs once per tab session and never blocks interaction.
const splash = document.querySelector('.splash');
let alreadyVisited = false;
try { alreadyVisited = sessionStorage.getItem('workplace-visited') === '1'; } catch { /* Private browsing may disable storage. */ }
if (!reducedMotion && !alreadyVisited && !location.hash) {
  splash.hidden = false;
  const count = splash.querySelector('.splash-count');
  const start = performance.now();
  const tick = now => {
    const progress = Math.min(100, Math.floor((now - start) / 20));
    count.textContent = String(progress);
    if (progress < 100) requestAnimationFrame(tick);
    else {
      setTimeout(() => splash.classList.add('exiting'), 200);
      setTimeout(() => { splash.hidden = true; }, 900);
    }
  };
  requestAnimationFrame(tick);
  try { sessionStorage.setItem('workplace-visited', '1'); } catch { /* Optional enhancement. */ }
}

// Native dialogs provide keyboard focus containment and Escape-to-close behavior.
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
function resetMenuState() {
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
function closeMenu() {
  resetMenuState();
  menu.close();
}
menuToggle.addEventListener('click', () => {
  menu.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
});
menu.querySelector('.close-menu').addEventListener('click', closeMenu);
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
menu.addEventListener('close', resetMenuState);
menu.addEventListener('click', event => { if (event.target === menu && event.clientX < menu.getBoundingClientRect().left) closeMenu(); });
window.matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches && menu.open) closeMenu(); });

const areas = {
  emotional: {
    kicker: 'EMOTIONAL WELLBEING', title: ['How are your', 'people feeling?'],
    description: 'Understand reported experiences of depression, anxiety, and stress, and open a thoughtful conversation about emotional wellbeing.',
    instruments: [['DASS-21', 'Depression, anxiety & stress']],
  },
  personal: {
    kicker: 'PERSONAL RESOURCES', title: ['The foundations', 'of wellbeing.'],
    description: 'Explore life satisfaction, self-worth, and the positive resources that give people a sense of purpose, growth, and direction.',
    instruments: [['Satisfaction With Life Scale', 'Overall life satisfaction'], ['Rosenberg Self-Esteem Scale', 'Global self-worth'], ['Ryff Psychological Wellbeing', 'Six dimensions of positive functioning']],
  },
  relationships: {
    kicker: 'RELATIONSHIPS & EMPATHY', title: ['How we connect', 'with each other.'],
    description: 'Consider empathy, perspective taking, and emotional responses to others. For relevant educational roles, explore perceived teacher–student relationships.',
    instruments: [['IRI adaptation', 'Empathic concern, perspective & distress'], ['Teacher–student relationship adaptation', 'Perceived closeness & conflict']],
  },
  preferences: {
    kicker: 'PERSONALITY & PREFERENCES', title: ['Different people.', 'Different perspectives.'],
    description: 'Bring broad personality tendencies, motivations, and preferences into the conversation to build a more rounded understanding of the individual.',
    instruments: [['Brief Big Five module', 'Five broad personality dimensions'], ['EPPS-inspired preference module', 'Motivations, preferences & needs']],
  },
  reflection: {
    kicker: 'REASONING & REFLECTION', title: ['Room for thought.', 'Space for context.'],
    description: 'Combine a brief nonverbal reasoning task with open-ended sentence completions. Background information and personal reflections add context for professional review.',
    instruments: [['Raven-style matrix module', 'Brief nonverbal reasoning task'], ['Rotter-inspired sentence completions', 'Expressed themes & personal reflections']],
  },
};
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function selectArea(tab) {
  const area = areas[tab.dataset.area];
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#assessment-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#area-kicker').textContent = area.kicker;
  const title = document.querySelector('#area-title');
  title.replaceChildren(document.createTextNode(area.title[0]), document.createElement('br'), document.createTextNode(area.title[1]));
  document.querySelector('#area-description').textContent = area.description;
  document.querySelector('#instrument-list').replaceChildren(...area.instruments.map(([name, detail]) => {
    const row = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = name;
    const description = document.createElement('span');
    description.textContent = detail;
    row.append(heading, description);
    return row;
  }));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectArea(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectArea(tabs[next]); tabs[next].focus(); }
  });
});

// Only replace the intentional placeholder once a supplied portrait has loaded.
if (config.teamPhoto) {
  const portraitLoader = new Image();
  portraitLoader.onload = () => {
    const portrait = document.querySelector('[data-portrait]');
    portrait.src = config.teamPhoto;
    portrait.alt = 'Prof. Dr. Amina Muazzam';
  };
  portraitLoader.src = config.teamPhoto;
}

if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${(index % 3) * 70}ms`;
    revealObserver.observe(element);
  });
}

const navLinks = Array.from(document.querySelectorAll('.desktop-nav a'));
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => {
      const current = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-20% 0px -60% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => navObserver.observe(section));
}

document.querySelector('#year').textContent = new Date().getFullYear();
const enquiryDialog = document.querySelector('#enquiry-dialog');
const copyStatus = document.querySelector('#copy-status');
let enquiryText = '';
document.querySelector('#enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const get = key => String(fields.get(key) || '').trim();
  enquiryText = [
    'WORKPLACE WELLBEING — ENQUIRY BRIEF', '',
    `Name: ${get('name')}`, `Work email: ${get('email')}`, `Organization: ${get('organization')}`,
    `Team size: ${get('size')}`, `Interested in: ${get('interest')}`, '',
    'What we would like to explore:', get('message'),
  ].join('\n');
  document.querySelector('#enquiry-preview').textContent = enquiryText;
  copyStatus.textContent = '';
  const email = document.querySelector('#email-enquiry');
  if (config.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
    email.href = `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(`Workplace wellbeing enquiry — ${get('organization')}`)}&body=${encodeURIComponent(enquiryText)}`;
    email.hidden = false;
  }
  enquiryDialog.showModal();
});
enquiryDialog.querySelector('.dialog-close').addEventListener('click', () => enquiryDialog.close());
enquiryDialog.addEventListener('click', event => {
  const rect = enquiryDialog.getBoundingClientRect();
  if (event.target === enquiryDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) enquiryDialog.close();
});
document.querySelector('#download-enquiry').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([enquiryText], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'workplace-wellbeing-enquiry.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  copyStatus.textContent = 'Your brief has been prepared for download.';
});
document.querySelector('#copy-enquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(enquiryText);
    copyStatus.textContent = 'Copied. Your brief is ready to paste into an email.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#enquiry-preview'));
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Your brief is selected. Press Ctrl+C (or Command+C) to copy, or use Download brief.';
  }
});
