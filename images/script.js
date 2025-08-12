/* === site behavior: projects loader, filters, contact form, theme toggle === */

document.addEventListener('DOMContentLoaded', () => {
  // Populate year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Load projects.json
  fetch('data/projects.json')
    .then(r => r.json())
    .then(data => {
      window.PROJECTS = data.projects || [];
      renderFilterOptions(window.PROJECTS);
      renderProjects(window.PROJECTS);
    })
    .catch(err => {
      console.error('Failed to load projects.json', err);
      document.getElementById('projectsGrid').innerHTML = '<p class="text-danger">Unable to load projects.</p>';
    });

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  const body = document.body;
  const saved = localStorage.getItem('theme');
  if(saved === 'dark'){ body.classList.add('dark'); themeBtn.textContent = 'Light'; }
  themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    const dark = body.classList.contains('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    themeBtn.textContent = dark ? 'Light' : 'Dark';
  });

  // Contact form (EmailJS config)
  emailjs.init('bdPZzZQuQWmVT0N_T'); // your public key (safe)
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if(!this.checkValidity()){
      this.classList.add('was-validated');
      return;
    }
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    emailjs.sendForm('service_pcxjg2u', 'template_h0f9sfu', this)
      .then(() => {
        document.getElementById('formStatus').textContent = 'Message sent — I will respond shortly.';
        contactForm.reset();
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send message';
      }, (err) => {
        console.error(err);
        document.getElementById('formStatus').textContent = 'Failed to send message — try again later.';
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send message';
      });
  });

  // Filter change
  document.getElementById('filterTech').addEventListener('change', function(){
    const val = this.value;
    const list = val === 'all' ? window.PROJECTS : window.PROJECTS.filter(p => p.tech.includes(val));
    renderProjects(list);
  });
});

/* Render functions */
function renderProjects(list){
  const container = document.getElementById('projectsGrid');
  container.innerHTML = '';
  if(!list.length){ container.innerHTML = '<p class="text-muted">No projects to display.</p>'; return; }
  list.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${p.image}" loading="lazy" alt="${escapeHtml(p.title)}" class="project-thumb" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted small">${escapeHtml(p.summary)}</p>
          <div class="mt-auto">
            <div class="mb-2">${p.tech.map(t => <span class="tech-tag">${escapeHtml(t)}</span>).join('')}</div>
            <div class="d-flex gap-2">
              <a href="${p.live || '#'}" target="_blank" rel="noopener" class="btn btn-sm btn-warning">View Project</a>
              <a href="${p.code || '#'}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">View Code</a>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function renderFilterOptions(projects){
  const techSet = new Set();
  projects.forEach(p => p.tech.forEach(t => techSet.add(t)));
  const sel = document.getElementById('filterTech');
  Array.from(techSet).sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    sel.appendChild(opt);
  });
}

/* Small utility to avoid XSS in the injected content (basic) */
function escapeHtml(str){
  if(!str) return '';
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}