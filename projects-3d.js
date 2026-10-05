/* 3D projects globe. Three.js r128 must load before this file. */
(function () {
  'use strict';

  // To add a project: append one object here. `h` = theme hue, `kind` = background animation
  // (leaf | code | pulse | orb). The globe, field lines and background pick it up automatically.
  const PROJECTS = [
    { n:'PlantTribe', tag:'01 / platform', c:'Platform', h:140, kind:'leaf', img:'images/planttribe.jpg', d:'Community platform for plant lovers.', about:'A community-driven platform connecting plant lovers to share care tips and trade cuttings.', facts:[['Category','Platform']], stack:[], live:'#', code:'https://github.com/SnehashisKundu', embed:false },
    { n:'Coffee With Backend', tag:'02 / content', c:'Content', h:30, kind:'code', img:'images/c&B.jpg', d:'Backend concepts, explained simply.', about:'A knowledge series breaking down backend engineering concepts for developers who build APIs.', facts:[['Category','Content']], stack:[], live:'#', code:'https://github.com/SnehashisKundu', embed:false },
    { n:'MediVault', tag:'03 / healthtech', c:'Healthtech', h:200, kind:'pulse', img:'images/medivault.jpg', d:'Medical history in one secure place.', about:"A secure record system that keeps a patient's medical history in one accessible place.", facts:[['Category','Healthtech']], stack:[], live:'#', code:'https://github.com/SnehashisKundu', embed:false },
    { n:'FindMe', tag:'04 / ai-safety', c:'AI / Computer Vision', h:335, kind:'orb', img:'', d:'AI-powered missing person detection from CCTV and video feeds.', about:'Full-stack system that detects and identifies missing persons using facial recognition. Faces are detected with MTCNN, recognised with FaceNet (DeepFace) and matched by cosine similarity. Authorities scan uploaded videos or live CCTV feeds from a dashboard with confidence scores, searchable reports and analytics, while users file complaints with photo and GPS location. Matches trigger real-time WebSocket alerts and automatic emails to the nearest police station. Languages used: Python (AI / backend), JavaScript (React frontend), HTML and CSS.', langs:[['JavaScript',40],['Python',39],['CSS',21]], facts:[['Category','AI / Safety'],['Matching','FaceNet512'],['Alerts','WebSocket + Email'],['Languages','Python, JavaScript']], stack:['FastAPI','DeepFace','MTCNN','MongoDB','WebSockets','React (Vite)','Tailwind CSS','Recharts'], live:'#', code:'https://github.com/SnehashisKundu/FINDME-Missing-Person-Detection-System', embed:false },
    { n:'MedCore', tag:'05 / healthtech', c:'Healthtech Backend', h:170, kind:'pulse', img:'', d:'Deployed hospital management backend with OPD and IPD workflows.', about:'A secure, modular hospital management backend that models connected workflows: patient to appointment to encounter to OPD or IPD care, then billing and discharge. Includes JWT auth with RBAC, audit logging, doctor schedules, bed and ward allocation, pharmacy, diagnostics, procedures, billing, and email / SMS / Socket.IO notifications with BullMQ-scheduled appointment reminders. Languages used: TypeScript (entire backend), with SQL via Prisma and PostgreSQL.', langs:[['TypeScript',100]], facts:[['Category','Healthtech'],['Type','Backend API'],['Status','Deployed'],['Languages','TypeScript']], stack:['Node.js','Express','TypeScript','PostgreSQL','Prisma','JWT / RBAC','Socket.IO','Redis','BullMQ','Twilio','Docker'], live:'https://medcore-hms-api-5v3l.onrender.com', code:'https://github.com/SnehashisKundu/Medcore-Hospital-Management-Platform', embed:false },
    { n:'VertexLearn', tag:'06 / edtech', c:'EdTech / AI', h:265, kind:'code', img:'', d:'AI-assisted learning management system, live on Render.', about:'A modular LMS backend that pairs classic learning workflows (courses, enrollment, progress, assignments, quizzes, certificates) with an AI layer: AI tutor with RAG over pgvector embeddings, lecture summaries, flashcards, AI-generated quizzes and study plans. Gamification covers points, streaks, badges and reward redemption, with Redis / BullMQ background jobs. Languages used: TypeScript (backend API) and Python (AI service).', langs:[['TypeScript',85],['Python',15]], facts:[['Category','EdTech'],['AI','RAG + Tutor'],['Hosting','Render'],['Languages','TypeScript, Python']], stack:['Node.js','Express','TypeScript','PostgreSQL','pgvector','Prisma','Redis','BullMQ','Zod','JWT / RBAC','Python AI service'], live:'https://verterxlearn.onrender.com', code:'https://github.com/SnehashisKundu/VerterxLearn-Learning-management-System', embed:false },
    { n:'Netflix AI Space', tag:'07 / ai-streaming', c:'AI / Streaming', h:355, kind:'orb', img:'', d:'AI-powered Netflix-style streaming experience.', about:'A Netflix-inspired AI space with a frontend and a backend, powered by the Google Gemini API with real-time updates over Socket.IO and WebSockets. Languages used: TypeScript. Full description coming soon.', langs:[['TypeScript',100]], facts:[['Category','AI / Streaming'],['Status','In progress'],['Languages','TypeScript']], stack:['TypeScript','Node.js','Express.js','PostgreSQL','Prisma','Redis','Socket.IO','WebSockets','Google Gemini API','JWT','Docker','Supabase','REST APIs','Git','Postman'], live:'#', code:'https://github.com/SnehashisKundu/Netflix-ai-space', embed:false }
  ];

  const section = document.getElementById('work');
  const stage = document.getElementById('pjStage');
  const fieldCanvas = document.getElementById('pjFieldCanvas');
  const canvas = document.getElementById('pjCanvas');
  const modal = document.getElementById('pjModal');
  if (!section || !stage || !canvas || !modal) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg = { ocean:'#08153d', hi:'#7fb8ff', lo:'#4580ee', emis:0x2f5fd0, wire:0x7fa6ff, atm:0x4f7bff, point:0xcfe4ff };
  const $ = (selector, root = document) => root.querySelector(selector);
  const hasLive = project => project.live && project.live !== '#';
  let controller = null;
  let lastFocus = null;

  let activeProject = -1;

  // Animated backdrop that morphs to the look of whichever project is hovered / focused.
  function startThemeBackground() {
    if (!fieldCanvas) return;
    const ctx = fieldCanvas.getContext('2d');
    const GLYPHS = '{}</>;=()01#$&';
    const fade = PROJECTS.map(() => 0);
    const seeds = PROJECTS.map(() => Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), s: .4 + Math.random() * .9, p: Math.random() * 6.28 })));
    let w = 0, h = 0, onScreen = true;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); w = stage.clientWidth; h = stage.clientHeight; fieldCanvas.width = w * dpr; fieldCanvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    new ResizeObserver(resize).observe(stage); resize();
    new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; }, { threshold:0 }).observe(stage);

    const scenes = {
      leaf(t, list, hue) {
        list.forEach(q => {
          const y = ((q.y + t * .00007 * q.s) % 1) * (h + 80) - 40, x = q.x * w + Math.sin(t * .001 * q.s + q.p) * 46, size = 9 + q.s * 13;
          ctx.save(); ctx.translate(x, y); ctx.rotate(t * .0011 * q.s + q.p);
          ctx.fillStyle = `hsla(${hue + (q.p * 6) % 28},62%,${42 + q.s * 14}%,.55)`; ctx.beginPath(); ctx.ellipse(0, 0, size, size * .42, 0, 0, 6.283); ctx.fill();
          ctx.strokeStyle = `hsla(${hue},70%,78%,.5)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-size, 0); ctx.lineTo(size, 0); ctx.stroke(); ctx.restore();
        });
      },
      code(t, list, hue) {
        ctx.font = '15px monospace'; const columns = Math.ceil(w / 26);
        for (let c = 0; c < columns; c++) {
          const speed = .07 + (c * 37 % 11) * .012, head = (t * speed + c * 83) % (h + 360) - 120;
          for (let k = 0; k < 14; k++) {
            ctx.fillStyle = `hsla(${hue},92%,${k ? 58 : 82}%,${(1 - k / 14) * .75})`;
            ctx.fillText(GLYPHS[(c * 7 + k * 3 + Math.floor(t / 180)) % GLYPHS.length], c * 26 + 6, head - k * 18);
          }
        }
      },
      pulse(t, list, hue) {
        const mid = h * .5; ctx.save(); ctx.strokeStyle = `hsl(${hue},90%,62%)`; ctx.lineWidth = 2.2; ctx.shadowBlur = 14; ctx.shadowColor = ctx.strokeStyle; ctx.beginPath();
        for (let x = 0; x <= w; x += 3) { const u = ((x + t * .16) % 300) / 300; let y = 0; if (u > .28 && u < .36) y = -14 * Math.sin((u - .28) / .08 * Math.PI); else if (u > .42 && u < .45) y = 12; else if (u > .45 && u < .5) y = -(h * .17) * Math.sin((u - .45) / .05 * Math.PI); else if (u > .5 && u < .54) y = 22 * Math.sin((u - .5) / .04 * Math.PI); x ? ctx.lineTo(x, mid + y) : ctx.moveTo(x, mid + y); }
        ctx.stroke(); ctx.restore();
        list.forEach(q => { const y = h - ((q.y + t * .00005 * q.s) % 1) * (h + 40) + 20, x = q.x * w, size = 5 + q.s * 7; ctx.strokeStyle = `hsla(${hue},85%,70%,.5)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size); ctx.stroke(); });
        for (let r = 0; r < 3; r++) { const k = ((t * .00035 + r / 3) % 1); ctx.strokeStyle = `hsla(${hue},90%,65%,${(1 - k) * .35})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w * .5, mid, k * Math.max(w, h) * .6, 0, 6.283); ctx.stroke(); }
      },
      orb(t, list, hue) {
        list.forEach(q => { const x = q.x * w + Math.sin(t * .0006 * q.s + q.p) * 30, y = q.y * h + Math.cos(t * .0005 * q.s + q.p) * 30, r = 6 + q.s * 16, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `hsla(${hue},90%,70%,.6)`); g.addColorStop(1, `hsla(${hue},90%,70%,0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); });
      }
    };

    const draw = t => {
      if (onScreen && !document.hidden && modal.hidden) {
        const base = ctx.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .45, Math.max(w, h) * .75);
        base.addColorStop(0, '#0f1d4a'); base.addColorStop(1, '#050816'); ctx.globalAlpha = 1; ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
        PROJECTS.forEach((project, index) => {
          fade[index] += ((index === activeProject ? 1 : 0) - fade[index]) * .06;
          if (fade[index] < .01) return;
          ctx.globalAlpha = fade[index];
          const tint = ctx.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, Math.max(w, h) * .7);
          tint.addColorStop(0, `hsla(${project.h},65%,24%,.85)`); tint.addColorStop(1, `hsla(${project.h},60%,8%,.9)`);
          ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h);
          (scenes[project.kind] || scenes.orb)(t, seeds[index], project.h);
        });
        ctx.globalAlpha = 1;
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (controller) controller.back();
    if (lastFocus) lastFocus.focus();
  }

  function openModal(index) {
    const project = PROJECTS[index];
    lastFocus = document.activeElement;
    const host = hasLive(project) ? project.live.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'your-project.com';
    const preview = project.embed && hasLive(project)
      ? `<iframe src="${project.live}" title="${project.n} live demo" loading="lazy"></iframe>`
      : `<div class="pj-shot">${project.img ? `<img src="${project.img}" alt="${project.n} screenshot">` : `<div class="pj-ph"><div class="pj-ph-in">${(project.stack.length ? project.stack : (project.langs || []).map(l => l[0])).slice(0, 8).map((t, i) => `<span style="--i:${i}">${t}</span>`).join('')}</div><p class="mono">Demo video coming soon</p></div>`}</div>`;
    const facts = project.facts.map(fact => `<div><b>${fact[1]}</b><span>${fact[0]}</span></div>`).join('');
    const LC = { TypeScript:'#3178c6', JavaScript:'#f1e05a', Python:'#3572a5', CSS:'#a06bd6' };
    const leaf = (text, color, i) => `<span style="--i:${i};--c:${color}">${text}</span>`;
    let step = 0;
    const groups = [];
    if (project.langs) groups.push(['Languages', project.langs.map(l => leaf(`${l[0]} <small>${l[1]}%</small>`, LC[l[0]] || '#7fb8ff', step++)).join('')]);
    if (project.stack.length) groups.push(['Built with', project.stack.map(item => leaf(item, 'var(--pj-acc)', step++)).join('')]);
    const stack = groups.length ? `<div class="pj-tree"><div class="pt-root"><b>${project.n}</b></div><ul>${groups.map((g, gi) => `<li style="--g:${gi}"><span class="pt-node">${g[0]}</span><div class="pt-leaves">${g[1]}</div></li>`).join('')}</ul></div>` : '';
    const langs = '';
    modal.innerHTML = `<div class="pj-card" role="dialog" aria-modal="true" aria-label="${project.n}">
      <button class="pj-close" type="button" aria-label="Close">&times;</button>
      <div class="pj-left"><span class="pj-tag mono">${project.tag || project.c}</span><h3>${project.n}</h3><p class="pj-lead">${project.d}</p>
        <h4>About the project</h4><p>${project.about}</p><div class="pj-facts">${facts}</div>${langs}${stack}
        <div class="pj-actions">${hasLive(project) ? `<a class="pj-btn" href="${project.live}" target="_blank" rel="noopener noreferrer">Open live demo &#8599;</a>` : `<span class="pj-btn pj-ghost" aria-disabled="true">Live demo coming soon</span>`}<a class="pj-btn pj-ghost" href="${project.code}" target="_blank" rel="noopener noreferrer">View code</a></div></div>
      <div class="pj-right"><div class="pj-bw"><div class="pj-bt"><b></b><b></b><b></b><span>${host}</span></div><div class="pj-bb">${preview}</div></div><p class="pj-note">${project.embed && hasLive(project) ? 'Live demo' : 'Preview. Open the live demo to use the real site.'}</p></div></div>`;
    modal.style.setProperty('--pj-acc', `hsl(${project.h},85%,62%)`);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.pj-close', modal).onclick = closeModal;
    modal.onclick = event => { if (event.target === modal) closeModal(); };
    $('.pj-close', modal).focus();
  }

  const list = document.createElement('ul');
  list.className = 'pj-list';
  list.innerHTML = PROJECTS.map((project, index) => `<li><button type="button" data-i="${index}">${project.img ? `<img src="${project.img}" alt="" loading="lazy">` : ''}<span>${project.n}</span><small class="mono">${project.tag || project.c}</small></button></li>`).join('');
  list.addEventListener('click', event => { const button = event.target.closest('button'); if (button) openModal(Number(button.dataset.i)); });
  stage.after(list);
  startThemeBackground();
  addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

  if (!window.THREE) { section.classList.add('pj-fallback'); return; }

  const hash = (x, y) => { const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return value - Math.floor(value); };
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), p = hash(xi, yi), q = hash(xi + 1, yi), r = hash(xi, yi + 1), s = hash(xi + 1, yi + 1); return p + (q - p) * a + (r - p) * b + (p - q - r + s) * a * b; };
  const fbm = (x, y) => { let sum = 0, amplitude = .5, frequency = 1; for (let i = 0; i < 5; i++) { sum += amplitude * noise(x * frequency, y * frequency); frequency *= 2; amplitude *= .5; } return sum; };
  const roundedRect = (context, x, y, width, height, radius) => { context.beginPath(); context.moveTo(x + radius, y); context.arcTo(x + width, y, x + width, y + height, radius); context.arcTo(x + width, y + height, x, y + height, radius); context.arcTo(x, y + height, x, y, radius); context.arcTo(x, y, x + width, y, radius); context.closePath(); };
  const radius = 14;

  function glowTexture() { const textureCanvas = document.createElement('canvas'); textureCanvas.width = textureCanvas.height = 128; const context = textureCanvas.getContext('2d'); const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64); gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(.25, 'rgba(255,255,255,.45)'); gradient.addColorStop(1, 'rgba(255,255,255,0)'); context.fillStyle = gradient; context.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(textureCanvas); }
  function globeTexture() { const width = 1024, height = 512, textureCanvas = document.createElement('canvas'); textureCanvas.width = width; textureCanvas.height = height; const context = textureCanvas.getContext('2d'); context.fillStyle = cfg.ocean; context.fillRect(0, 0, width, height); for (let y = 4; y < height; y += 8) for (let x = 4; x < width; x += 8) { const u = x / width, v = y / height, value = fbm(Math.cos(u * Math.PI * 2) * 2.6, (Math.sin(u * Math.PI * 2) * 2.1 + v * 3.1) * 1.25); if (value > .5) { context.fillStyle = value > .62 ? cfg.hi : cfg.lo; context.beginPath(); context.arc(x, y, 2.7 * Math.cos((v - .5) * 3.1) + .8, 0, Math.PI * 2); context.fill(); } } const texture = new THREE.CanvasTexture(textureCanvas); texture.anisotropy = 4; return texture; }
  function emblemTexture() { const textureCanvas = document.createElement('canvas'); textureCanvas.width = textureCanvas.height = 256; const context = textureCanvas.getContext('2d'); context.fillStyle = '#0b0f14'; roundedRect(context, 16, 16, 224, 224, 56); context.fill(); context.fillStyle = '#f2b84b'; context.font = '700 84px monospace'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText('</>', 128, 134); return new THREE.CanvasTexture(textureCanvas); }
  function cardTexture(project) { const textureCanvas = document.createElement('canvas'); textureCanvas.width = 512; textureCanvas.height = 340; const context = textureCanvas.getContext('2d'); const texture = new THREE.CanvasTexture(textureCanvas); texture.anisotropy = 4; let image = null; const draw = () => { context.clearRect(0, 0, 512, 340); context.save(); roundedRect(context, 0, 0, 512, 340, 34); context.clip(); if (image) { const scale = Math.max(512 / image.width, 340 / image.height), width = image.width * scale, height = image.height * scale; context.drawImage(image, (512 - width) / 2, (340 - height) / 2, width, height); } else { const gradient = context.createLinearGradient(0, 0, 512, 340); gradient.addColorStop(0, `hsl(${project.h},70%,52%)`); gradient.addColorStop(1, `hsl(${project.h + 45},65%,28%)`); context.fillStyle = gradient; context.fillRect(0, 0, 512, 340); } const shade = context.createLinearGradient(0, 140, 0, 340); shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,.8)'); context.fillStyle = shade; context.fillRect(0, 0, 512, 340); context.restore(); context.fillStyle = '#fff'; context.font = '700 42px "Space Grotesk",sans-serif'; context.fillText(project.n, 28, 280); context.globalAlpha = .8; context.font = '500 21px monospace'; context.fillText(project.tag || project.c, 28, 312); context.globalAlpha = 1; texture.needsUpdate = true; }; draw(); if (project.img) { const imageElement = new Image(); imageElement.onload = () => { image = imageElement; draw(); }; imageElement.src = project.img; } return texture; }
  // Dipole-style field line: leaves the globe near one pole, bulges out to `lineRadius` at the equator, returns near the opposite pole.
  const fieldPoint = (lineRadius, angle, theta) => {
    const start = Math.asin(Math.sqrt(radius / lineRadius)) * .5, s0 = Math.sin(start) ** 2, s = Math.sin(theta) ** 2;
    const distance = radius + (lineRadius - radius) * Math.max(0, (s - s0) / (1 - s0));
    return new THREE.Vector3(distance * Math.sin(theta) * Math.cos(angle), distance * Math.cos(theta), distance * Math.sin(theta) * Math.sin(angle));
  };
  const fieldPoints = (lineRadius, angle, count) => { const start = Math.asin(Math.sqrt(radius / lineRadius)) * .5, points = []; for (let index = 0; index <= count; index++) points.push(fieldPoint(lineRadius, angle, start + (Math.PI - 2 * start) * index / count)); return points; };

  const frontMaterial = (color, strength) => new THREE.ShaderMaterial({ uniforms:{ color:{value:new THREE.Color(color)}, strength:{value:strength} }, vertexShader:'varying vec3 normalDirection;varying vec3 viewDirection;void main(){normalDirection=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);viewDirection=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}', fragmentShader:'uniform vec3 color;uniform float strength;varying vec3 normalDirection;varying vec3 viewDirection;void main(){float edge=pow(1.-abs(dot(normalDirection,viewDirection)),2.2);gl_FragColor=vec4(color,clamp(edge*strength,0.,1.));}', side:THREE.FrontSide, blending:THREE.AdditiveBlending, transparent:true, depthWrite:false });

  function build() {
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true }); } catch (error) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, .1, 3000), glow = glowTexture(), group = new THREE.Group(); group.rotation.z = 0; scene.add(group);
    scene.add(new THREE.AmbientLight(0x6f86d8, .7)); const directional = new THREE.DirectionalLight(0xffffff, 1.1); directional.position.set(60, 50, 80); scene.add(directional);
    const stars = new Float32Array(1200 * 3); for (let index = 0; index < 1200; index++) { const angle = Math.random() * Math.PI * 2, elevation = Math.acos(2 * Math.random() - 1), distance = 220 + Math.random() * 180; stars[index * 3] = distance * Math.sin(elevation) * Math.cos(angle); stars[index * 3 + 1] = distance * Math.cos(elevation); stars[index * 3 + 2] = distance * Math.sin(elevation) * Math.sin(angle); } const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3)); scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color:0xcfe4ff, size:1.8, sizeAttenuation:false, transparent:true, opacity:.75 })));
    const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), new THREE.MeshStandardMaterial({ map:globeTexture(), emissive:cfg.emis, emissiveIntensity:.55, roughness:.8 })); group.add(globe);
    group.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(radius * 1.015, 24, 16)), new THREE.LineBasicMaterial({ color:cfg.wire, transparent:true, opacity:.14 })));
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.22, 48, 32), frontMaterial(cfg.atm, 1.3)); group.add(atmosphere);
    const emblem = new THREE.Sprite(new THREE.SpriteMaterial({ map:emblemTexture(), transparent:true, depthTest:false })); emblem.scale.set(11, 11, 1); emblem.renderOrder = 20; group.add(emblem);
    const lines = [], particleLines = [], particleData = [];
    [22, 32, 44].forEach((lineRadius, lineIndex) => { for (let index = 0; index < 5; index++) { const points = fieldPoints(lineRadius, index / 5 * Math.PI * 2 + lineIndex * .6, 80); particleLines.push({ points, count:80, color:null }); } });
    const linePositions = [], lineColors = []; particleLines.forEach(line => { for (let index = 0; index < line.count; index++) { const start = line.points[index], end = line.points[index + 1]; linePositions.push(start.x,start.y,start.z,end.x,end.y,end.z); lineColors.push(.4,.55,.9,.4,.55,.9); } });
    const lineGeometry = new THREE.BufferGeometry(); lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3)); lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3)); group.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:.3, blending:THREE.AdditiveBlending, depthTest:false, depthWrite:false })));
    particleLines.slice(0, 0).forEach(line => { const curve = new THREE.CatmullRomCurve3(line.points); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, .12, 6, false), new THREE.MeshBasicMaterial({ color:0x5d9dff, transparent:true, opacity:.9, depthTest:false, depthWrite:false })); group.add(tube); });
    const KIND = { leaf:{ vy:-3, sway:4 }, code:{ vy:-14, sway:0 }, pulse:{ vy:4, sway:2 }, orb:{ vy:0, sway:3 } };
    const nodes = PROJECTS.map((project, index) => {
      const lineRadius = 48 + (index % 3) * 12, angle = index / PROJECTS.length * Math.PI * 2 + .6, theta = Math.PI / 2 + [-.42, .3, -.1, .45, -.35, .15, .4][index % 7], color = new THREE.Color(`hsl(${project.h},90%,66%)`);
      // magnetic flux tube: one bright field line plus neighbours, all rising from the globe and threading through this project
      const lineMats = [];
      for (let k = 0; k <= 0; k++) {
        const points = fieldPoints(lineRadius * (1 + k * .03), angle + k * .06, 100), main = k === 0, base = main ? .95 : .45;
        const material = new THREE.LineBasicMaterial({ color, transparent:true, opacity:base, blending:THREE.AdditiveBlending, depthWrite:false });
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material)); lineMats.push({ material, base });
        if (main) group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 100, .22, 6, false), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.22, blending:THREE.AdditiveBlending, depthWrite:false })));
        lines.push({ points, count:100, color, flow:main ? 5 : 2 });
      }
      // anchor glow where the field line meets the globe surface
      const anchorGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glow, color, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthTest:false })); anchorGlow.position.copy(fieldPoints(lineRadius, angle, 100)[0]); anchorGlow.scale.set(9, 9, 1); group.add(anchorGlow);
      const node = new THREE.Group(); node.position.copy(fieldPoint(lineRadius, angle, theta)); group.add(node);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:glow, color, transparent:true, opacity:.35, blending:THREE.AdditiveBlending, depthWrite:false })); halo.scale.set(30, 30, 1); node.add(halo);
      const card = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 5.8), new THREE.MeshBasicMaterial({ map:cardTexture(project), transparent:true })); node.add(card);
      const shield = new THREE.Mesh(new THREE.SphereGeometry(7.6, 32, 24), frontMaterial(color, .6)); node.add(shield);
      const rings = [0, 1].map(ringIndex => { const ring = new THREE.Mesh(new THREE.TorusGeometry(8.2, .08, 8, 72), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.6, blending:THREE.AdditiveBlending, depthWrite:false })); ring.rotation.set(1.1 + ringIndex * .9, ringIndex * 1.2, 0); node.add(ring); return ring; });
      const hit = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 8), new THREE.MeshBasicMaterial({ visible:false })); hit.userData.index = index; node.add(hit);
      // 3D backdrop around the project: leaves / code / vitals, themed by project.kind
      const kind = KIND[project.kind] || KIND.orb, count = 200, cloudRange = 26, cloudPos = new Float32Array(count * 3), seeds = [];
      for (let i = 0; i < count; i++) { cloudPos.set([(Math.random() - .5) * cloudRange * 2, (Math.random() - .5) * cloudRange * 2, (Math.random() - .5) * cloudRange * 2], i * 3); seeds.push({ v:kind.vy * (.6 + Math.random() * .8), p:Math.random() * 6.28, w:.5 + Math.random() }); }
      const cloudGeometry = new THREE.BufferGeometry(); cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
      const cloud = new THREE.Points(cloudGeometry, new THREE.PointsMaterial({ color, size:project.kind === 'code' ? 5 : 8, sizeAttenuation:false, map:glow, transparent:true, opacity:.22, blending:THREE.AdditiveBlending, depthWrite:false })); cloud.frustumCulled = false; node.add(cloud);
      return { node, card, shield, rings, hit, halo, lineMats, anchorGlow, cloud, cloudPos, cloudGeometry, cloudSeeds:seeds, cloudRange, kind, scale:1, strength:.6 };
    });
    const arrowAxis = new THREE.Vector3(0, 1, 0), arrows = [];
    lines.forEach((line, lineIndex) => { for (let index = 0; index < (line.flow || 6); index++) particleData.push({ line, t:Math.random(), speed:.05 + Math.random() * .05 }); if (lineIndex % 2 === 0) for (let index = 0; index < 1; index++) { const arrow = new THREE.Mesh(new THREE.ConeGeometry(.7, 3.2, 6), new THREE.MeshBasicMaterial({ color:line.color || cfg.point, transparent:true, opacity:.95, blending:THREE.AdditiveBlending, depthTest:false, depthWrite:false })); group.add(arrow); arrows.push({ line, mesh:arrow, t:(index + .5) / 2, speed:.08 + index * .012 }); } }); const positions = new Float32Array(particleData.length * 3), particleColors = new Float32Array(particleData.length * 3); particleData.forEach((particle, index) => { const color = particle.line.color || new THREE.Color(cfg.point); particleColors.set([color.r,color.g,color.b], index * 3); }); const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3)); group.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ size:11, sizeAttenuation:false, map:glow, vertexColors:true, transparent:true, blending:THREE.AdditiveBlending, depthTest:false, depthWrite:false })));
    let arrowTime = performance.now(); const animateArrows = time => { const delta = Math.min(.05, (time - arrowTime) / 1000); arrowTime = time; arrows.forEach(arrow => { arrow.t = (arrow.t + arrow.speed * delta) % 1; const position = arrow.t * arrow.line.count, start = arrow.line.points[Math.min(arrow.line.count - 1, Math.floor(position))], end = arrow.line.points[Math.min(arrow.line.count, Math.floor(position) + 1)], amount = position - Math.floor(position); arrow.mesh.position.set(start.x + (end.x - start.x) * amount, start.y + (end.y - start.y) * amount, start.z + (end.z - start.z) * amount); arrow.mesh.quaternion.setFromUnitVectors(arrowAxis, end.clone().sub(start).normalize()); }); if (!reduce) requestAnimationFrame(animateArrows); }; requestAnimationFrame(animateArrows);
    const state = { theta:.7, phi:1.15, distance:165, target:new THREE.Vector3(), focus:new THREE.Vector3(), ray:new THREE.Raycaster(), mouse:new THREE.Vector2(9,9) }; let focused = -1, hovered = -1, dragging = false, startX = 0, startY = 0, moved = 0, baseDistance = 165, targetSpeed = 1, speed = 1, visible = true;
    const resize = () => { const width = stage.clientWidth, height = stage.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); baseDistance = 165 * Math.max(1, 1.25 / camera.aspect); }; new ResizeObserver(resize).observe(stage); resize(); new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold:0 }).observe(stage);
    const pick = () => { state.ray.setFromCamera(state.mouse, camera); const hit = state.ray.intersectObjects(nodes.map(node => node.hit), false)[0]; hovered = hit ? hit.object.userData.index : -1; targetSpeed = hovered >= 0 ? .15 : 1; stage.style.cursor = hovered >= 0 ? 'pointer' : ''; };
    stage.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX; startY = event.clientY; moved = 0; }); stage.addEventListener('pointermove', event => { const bounds = stage.getBoundingClientRect(); state.mouse.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1); if (dragging) { const dx = event.clientX - startX, dy = event.clientY - startY; moved += Math.abs(dx) + Math.abs(dy); state.theta -= dx * .006; state.phi = Math.max(.3, Math.min(1.55, state.phi - dy * .005)); startX = event.clientX; startY = event.clientY; } pick(); }); addEventListener('pointerup', () => { if (!dragging) return; dragging = false; if (moved < 6) { pick(); if (hovered >= 0) { const index = hovered; focused = index; setTimeout(() => { if (focused === index) openModal(index); }, 650); } } }); stage.addEventListener('pointerleave', () => { state.mouse.set(9,9); hovered = -1; targetSpeed = 1; });
    const animate = time => { if (!document.body.contains(stage)) { renderer.dispose(); return; } requestAnimationFrame(animate); if (!visible || document.hidden || !modal.hidden) return; speed += (targetSpeed - speed) * .08; const delta = reduce ? 0 : Math.min(.05, .016 * speed); globe.rotation.y += delta * .08; particleData.forEach((particle, index) => { particle.t = (particle.t + particle.speed * delta) % 1; const position = particle.t * particle.line.count, start = particle.line.points[Math.min(particle.line.count - 1, Math.floor(position))], end = particle.line.points[Math.min(particle.line.count, Math.floor(position) + 1)], amount = position - Math.floor(position); positions.set([start.x + (end.x - start.x) * amount,start.y + (end.y - start.y) * amount,start.z + (end.z - start.z) * amount], index * 3); }); particleGeometry.attributes.position.needsUpdate = true; activeProject = hovered >= 0 ? hovered : focused; atmosphere.material.uniforms.strength.value = 1.3 + .3 * Math.sin(time * .0015); nodes.forEach((node, index) => { node.card.lookAt(camera.position); const active = index === hovered || index === focused, pulse = .75 + .25 * Math.sin(time * .003 + index * 1.7); node.card.position.y = Math.sin(time * .0015 + index * 2) * .5; node.halo.material.opacity += ((active ? .6 : .3) * pulse - node.halo.material.opacity) * .1; node.cloud.material.opacity += ((active ? .95 : .22) - node.cloud.material.opacity) * .06; node.lineMats.forEach(entry => { entry.material.opacity = entry.base * (active ? 1 : .72) * pulse; }); node.anchorGlow.scale.setScalar(8 + 3 * pulse + (active ? 3 : 0)); { const range = node.cloudRange, pos = node.cloudPos; node.cloudSeeds.forEach((q, i) => { pos[i * 3] += Math.sin(time * .001 * q.w + q.p) * node.kind.sway * delta; let y = pos[i * 3 + 1] + q.v * delta; if (y < -range) y += range * 2; else if (y > range) y -= range * 2; pos[i * 3 + 1] = y; }); node.cloudGeometry.attributes.position.needsUpdate = true; } const targetScale = active ? 1.14 : 1; node.scale += (targetScale - node.scale) * .12; node.card.scale.setScalar(node.scale); node.strength += ((active ? 1.3 : .6) - node.strength) * .1; node.shield.material.uniforms.strength.value = node.strength; node.rings.forEach((ring, ringIndex) => { ring.rotation.z += delta * (.5 + ringIndex * .3); }); }); if (!dragging && focused < 0 && !reduce) state.theta += delta * .05; if (focused >= 0) nodes[focused].node.getWorldPosition(state.focus); else state.focus.set(0,0,0); state.target.lerp(state.focus, .08); state.distance += ((focused >= 0 ? 26 : baseDistance) - state.distance) * .06; camera.position.set(state.target.x + state.distance * Math.sin(state.phi) * Math.sin(state.theta),state.target.y + state.distance * Math.cos(state.phi),state.target.z + state.distance * Math.sin(state.phi) * Math.cos(state.theta)); camera.lookAt(state.target); renderer.render(scene, camera); };
    requestAnimationFrame(animate); return { back:() => { focused = -1; } };
  }

  controller = build();
  if (!controller) section.classList.add('pj-fallback');
})();
