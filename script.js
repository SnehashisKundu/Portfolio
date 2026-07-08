// =========================================================
// Preloader
// =========================================================
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
const preloaderPct = document.getElementById('preloaderPct');

(function runPreloader(){
  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 12) + 4;
    if (pct >= 100){
      pct = 100;
      clearInterval(interval);
      setTimeout(() => preloader.classList.add('loaded'), 250);
    }
    preloaderFill.style.width = pct + '%';
    preloaderPct.textContent = String(pct).padStart(2, '0') + '%';
  }, 90);
})();

// Safety net: never let the preloader block the page
window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('loaded'), 900);
});

// =========================================================
// Custom cursor
// =========================================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing){
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll('a, button, .card, input, textarea');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1'; cursorRing.style.opacity = '.7';
  });
}

// =========================================================
// Header scroll state + active link + progress bar
// =========================================================
const header = document.getElementById('site-header');
const scrollBar = document.getElementById('scrollBar');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll(){
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  scrollTopBtn.classList.toggle('visible', y > 500);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';

  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 140;
    if (y >= top) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

scrollTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

// =========================================================
// Mobile nav toggle
// =========================================================
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primary-nav');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  primaryNav.classList.toggle('open');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  navToggle.classList.remove('open');
  primaryNav.classList.remove('open');
}));

// =========================================================
// Hero role typewriter
// =========================================================
const roles = ['backend systems.', 'clean APIs.', 'data pipelines.', 'reliable tools.'];
const roleEl = document.querySelector('.typewriter-text');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeRole(){
  const word = roles[roleIndex];
  if (!deleting){
    charIndex++;
    roleEl.textContent = word.slice(0, charIndex);
    if (charIndex === word.length){
      deleting = true;
      setTimeout(typeRole, 1400);
      return;
    }
  } else {
    charIndex--;
    roleEl.textContent = word.slice(0, charIndex);
    if (charIndex === 0){
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeRole, deleting ? 40 : 80);
}
if (roleEl) typeRole();

// =========================================================
// Terminal boot sequence
// =========================================================
const terminalBody = document.getElementById('terminalBody');
const bootLines = [
  { type:'prompt', text:'$ whoami' },
  { type:'out',    text:'snehashis-kundu' },
  { type:'prompt', text:'$ cat role.txt' },
  { type:'out',    text:'Backend Developer & Data Analyst' },
  { type:'prompt', text:'$ cat stack.txt' },
  { type:'out',    text:'Python · Node.js · React · Django · MySQL · MongoDB' },
  { type:'prompt', text:'$ status --check' },
  { type:'out',    text:'available for opportunities ✓' },
];

function typeTerminal(){
  if (!terminalBody) return;
  let lineIdx = 0;

  function nextLine(){
    if (lineIdx >= bootLines.length){
      terminalBody.innerHTML += '<span class="prompt">$</span> <span class="cursor"></span>';
      return;
    }
    const line = bootLines[lineIdx];
    const span = document.createElement('div');
    const cls = line.type === 'prompt' ? 'prompt' : 'out';
    span.innerHTML = `<span class="${cls}"></span>`;
    terminalBody.appendChild(span);
    const target = span.querySelector('span');

    let i = 0;
    const speed = line.type === 'prompt' ? 45 : 18;
    const interval = setInterval(() => {
      target.textContent += line.text[i];
      i++;
      if (i >= line.text.length){
        clearInterval(interval);
        lineIdx++;
        setTimeout(nextLine, line.type === 'prompt' ? 200 : 420);
      }
    }, speed);
  }
  nextLine();
}

// =========================================================
// Scroll reveal (IntersectionObserver)
// =========================================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting){
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Kick off terminal typing once hero terminal scrolls into view (or immediately if already visible)
const heroTerminal = document.querySelector('.hero-terminal');
if (heroTerminal){
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        typeTerminal();
        termObserver.disconnect();
      }
    });
  }, { threshold:0.2 });
  termObserver.observe(heroTerminal);
}

// =========================================================
// Skill bars: staggered fill + counting percentage + pulse
// =========================================================
const skillGroups = document.querySelectorAll('.skill-group');
skillGroups.forEach(group => {
  const groupObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const barsInGroup = entry.target.querySelectorAll('.bar');
      barsInGroup.forEach((bar, i) => {
        setTimeout(() => {
          const line = bar.querySelector('.line[data-value]');
          const pctEl = bar.querySelector('.skill-pct');
          bar.classList.add('in-view');

          if (line){
            const value = line.dataset.value;
            line.style.setProperty('--w', value + '%');
            line.classList.add('filled');
          }
          if (pctEl){
            const target = parseInt(pctEl.dataset.target, 10);
            const duration = 1300;
            const start = performance.now();
            function step(now){
              const progress = Math.min((now - start) / duration, 1);
              pctEl.textContent = Math.floor(target * progress) + '%';
              if (progress < 1) requestAnimationFrame(step);
              else {
                pctEl.textContent = target + '%';
                if (line){
                  line.classList.add('pulse');
                  setTimeout(() => line.classList.remove('pulse'), 700);
                }
              }
            }
            requestAnimationFrame(step);
          }
        }, i * 140);
      });
      groupObserver.unobserve(entry.target);
    });
  }, { threshold:0.3 });
  groupObserver.observe(group);
});

// =========================================================
// About stat counters
// =========================================================
const statEls = document.querySelectorAll('.stat-num[data-count]');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.count.includes('.');
    const duration = 1200;
    const start = performance.now();

    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const value = target * progress;
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : target;
    }
    requestAnimationFrame(step);
    statObserver.unobserve(el);
  });
}, { threshold:0.5 });
statEls.forEach(el => statObserver.observe(el));

// =========================================================
// Contact form — submits to Formspree
// =========================================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const sendBtn = document.getElementById('sendBtn');

if (contactForm){
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message){
      formStatus.textContent = ' please fill in every field';
      formStatus.style.color = '#E8663C';
      return;
    }

    sendBtn.disabled = true;
    formStatus.textContent = ' sending...';
    formStatus.style.color = '#8FA0AF';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (response.ok){
        formStatus.textContent = `message received — thanks, ${name}. I'll reply soon.`;
        formStatus.style.color = '#4FD1C5';
        contactForm.reset();
      } else {
        formStatus.textContent = ' something went wrong — please email me directly instead';
        formStatus.style.color = '#E8663C';
      }
    } catch (err){
      formStatus.textContent = ' network error — please email me directly instead';
      formStatus.style.color = '#E8663C';
    } finally {
      sendBtn.disabled = false;
    }
  });
}