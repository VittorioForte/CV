/* ── TYPEWRITER ───────────────────────────────────── */
(function() {
  const el = document.getElementById('typewriter');
  const words = ['Front-End Developer', 'Data Analyst', 'Co-Founder @ Pixora'];
  let wi = 0, ci = 0, deleting = false, wait = 0;

  function type() {
    if (wait > 0) { wait--; setTimeout(type, 60); return; }

    const word = words[wi];

    if (!deleting) {
      if (ci < word.length) {
        el.textContent = word.substring(0, ci + 1);
        ci++;
        setTimeout(type, 55 + Math.random() * 40);
      } else {
        wait = 28;
        deleting = true;
        setTimeout(type, 60);
      }
    } else {
      if (ci > 0) {
        ci--;
        el.textContent = word.substring(0, ci);
        setTimeout(type, 28);
      } else {
        wi = (wi + 1) % words.length;
        deleting = false;
        wait = 8;
        setTimeout(type, 60);
      }
    }
  }
  setTimeout(type, 800);
})();

/* ── NAVBAR HIDE/SHOW ON SCROLL ──────────────────── */
(function() {
  const nav = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 80) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

/* ── HAMBURGER MENU ──────────────────────────────── */
(function() {
  const btn = document.getElementById('hamburger');
  const drawer = document.getElementById('nav-drawer');
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();

/* ── SCROLL REVEAL ───────────────────────────────── */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── SKILL PILLS STAGGER ─────────────────────────── */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.pill').forEach((pill, i) => {
          setTimeout(() => pill.classList.add('visible'), i * 60);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skills-section').forEach(el => observer.observe(el));
})();

/* ── LIGHTBOX ────────────────────────────────────── */
(function() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close');

  document.querySelectorAll('.study-card[data-diploma]').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.diploma;
      img.src = src;
      img.alt = card.querySelector('.study-title').textContent + ' diploma';
      lb.classList.add('open');
      lb.focus();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

  close.addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lb.classList.remove('open');
  });
})();

/* ── CODE MODAL ─────────────────────────────────── */
(function() {
  const modal = document.getElementById('code-modal');
  const modalTitle = document.getElementById('code-modal-title');
  const iframe = document.getElementById('code-modal-iframe');
  const closeBtn = document.getElementById('code-modal-close');
  const extLink = document.getElementById('code-modal-external');
  const tabPreview = document.getElementById('tab-preview');
  const tabCode = document.getElementById('tab-code');
  const codeViewer = document.getElementById('code-viewer');
  const codeTree = document.getElementById('code-tree');
  const codeContent = document.getElementById('code-content');
  const codeFileHeader = document.getElementById('code-file-header');

  let currentLive = '';
  let currentRepo = '';
  let currentOwner = '';
  let currentRepoName = '';
  const treeCache = {};
  const fileCache = {};

  function parseRepo(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? { owner: match[1], repo: match[2] } : null;
  }

  function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      html:'🌐', htm:'🌐', css:'🎨', scss:'🎨', sass:'🎨',
      js:'⚡', jsx:'⚡', ts:'⚡', tsx:'⚡',
      json:'📋', xml:'📋', py:'🐍', rb:'💎', php:'🐘',
      cpp:'⚙️', c:'⚙️', h:'⚙️', hpp:'⚙️', cs:'⚙️',
      java:'☕', md:'📝', txt:'📄',
      png:'🖼️', jpg:'🖼️', jpeg:'🖼️', gif:'🖼️', svg:'🖼️', ico:'🖼️',
      gitignore:'🚫', env:'🔒',
      yml:'⚙️', yaml:'⚙️', sh:'💻', bat:'💻',
      r:'📈', R:'📈', sql:'🗄️'
    };
    return icons[ext] || '📄';
  }

  function buildTree(files) {
    const root = {};
    files.forEach(function(file) {
      if (file.type !== 'blob') return;
      const parts = file.path.split('/');
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = { type: 'file', path: file.path, size: file.size };
        } else {
          if (!current[part]) current[part] = { type: 'folder', children: {} };
          current = current[part].children;
        }
      }
    });
    return root;
  }

  function renderTree(tree, container, depth) {
    const keys = Object.keys(tree).sort(function(a, b) {
      const aF = tree[a].type === 'folder', bF = tree[b].type === 'folder';
      if (aF && !bF) return -1;
      if (!aF && bF) return 1;
      return a.localeCompare(b);
    });

    keys.forEach(function(name) {
      const item = tree[name];
      if (item.type === 'folder') {
        const folder = document.createElement('div');
        folder.className = 'code-tree-folder';
        folder.style.paddingLeft = (1 + depth * 0.9) + 'rem';
        folder.innerHTML = '<span class="folder-arrow">▶</span><span class="folder-icon">📁</span>' + name;
        folder.addEventListener('click', function() { folder.classList.toggle('open'); });
        container.appendChild(folder);

        const children = document.createElement('div');
        children.className = 'code-tree-children';
        container.appendChild(children);
        renderTree(item.children, children, depth + 1);
      } else {
        const fileEl = document.createElement('div');
        fileEl.className = 'code-tree-item';
        fileEl.style.paddingLeft = (1 + depth * 0.9) + 'rem';
        fileEl.innerHTML = '<span class="file-icon">' + getFileIcon(name) + '</span>' + name;
        fileEl.addEventListener('click', function() {
          loadFile(item.path);
          codeTree.querySelectorAll('.code-tree-item.active').forEach(function(el) { el.classList.remove('active'); });
          fileEl.classList.add('active');
        });
        container.appendChild(fileEl);
      }
    });
  }

  function loadTree() {
    const cacheKey = currentOwner + '/' + currentRepoName;
    if (treeCache[cacheKey]) {
      codeTree.innerHTML = '';
      renderTree(treeCache[cacheKey], codeTree, 0);
      return;
    }

    codeTree.innerHTML = '<div class="code-tree-loading">Loading repository...</div>';

    fetch('https://api.github.com/repos/' + currentOwner + '/' + currentRepoName + '/git/trees/main?recursive=1')
      .then(function(res) {
        if (!res.ok) return fetch('https://api.github.com/repos/' + currentOwner + '/' + currentRepoName + '/git/trees/master?recursive=1');
        return res;
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Repository not found');
        return res.json();
      })
      .then(function(data) {
        const tree = buildTree(data.tree);
        treeCache[cacheKey] = tree;
        codeTree.innerHTML = '';
        renderTree(tree, codeTree, 0);
      })
      .catch(function(err) {
        codeTree.innerHTML = '<div class="code-error">' +
          '<div class="code-error-icon">⚠️</div>' +
          '<div class="code-error-msg">Could not load repository.<br>' + err.message + '</div>' +
          '<a href="' + currentRepo + '" target="_blank" rel="noopener noreferrer" class="code-error-link">Open on GitHub →</a></div>';
      });
  }

  function loadFile(path) {
    const cacheKey = currentOwner + '/' + currentRepoName + '/' + path;
    codeFileHeader.querySelector('.code-file-path').textContent = path;

    const ext = path.split('.').pop().toLowerCase();
    const binaryExts = ['png','jpg','jpeg','gif','ico','woff','woff2','ttf','eot','mp4','mp3','pdf','zip'];
    if (binaryExts.indexOf(ext) !== -1) {
      codeContent.innerHTML = '<code class="code-placeholder">Binary file — cannot display preview.\nOpen on GitHub to view.</code>';
      return;
    }

    if (fileCache[cacheKey]) { displayCode(fileCache[cacheKey]); return; }

    codeContent.innerHTML = '<code class="code-placeholder">Loading...</code>';

    fetch('https://raw.githubusercontent.com/' + currentOwner + '/' + currentRepoName + '/main/' + path)
      .then(function(res) {
        if (!res.ok) return fetch('https://raw.githubusercontent.com/' + currentOwner + '/' + currentRepoName + '/master/' + path);
        return res;
      })
      .then(function(res) {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(function(text) {
        fileCache[cacheKey] = text;
        displayCode(text);
      })
      .catch(function() {
        codeContent.innerHTML = '<code class="code-placeholder">Could not load file content.</code>';
      });
  }

  function displayCode(text) {
    const lines = text.split('\n');
    let html = '';
    for (let i = 0; i < lines.length; i++) {
      const escaped = lines[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += '<div class="code-line"><span class="code-line-num">' + (i + 1) + '</span><span class="code-line-content">' + escaped + '</span></div>';
    }
    codeContent.innerHTML = html;
  }

  function openModal(card) {
    const projTitle = card.querySelector('.proj-title').textContent;
    currentLive = card.dataset.live || '';
    currentRepo = card.dataset.repo || '';
    const parsed = parseRepo(currentRepo);
    if (parsed) { currentOwner = parsed.owner; currentRepoName = parsed.repo; }

    modalTitle.textContent = projTitle;

    if (!currentLive) {
      tabPreview.style.display = 'none';
      setTab('code');
    } else {
      tabPreview.style.display = '';
      setTab('preview');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = 'about:blank';
    iframe.style.display = '';
    codeViewer.classList.remove('active');
    document.body.style.overflow = '';
    codeContent.innerHTML = '<code class="code-placeholder">← Choose a file from the sidebar</code>';
    codeFileHeader.querySelector('.code-file-path').textContent = 'Select a file to view';
    codeTree.querySelectorAll('.code-tree-item.active').forEach(function(el) { el.classList.remove('active'); });
  }

  function setTab(tab) {
    tabPreview.classList.toggle('active', tab === 'preview');
    tabCode.classList.toggle('active', tab === 'code');

    if (tab === 'preview') {
      iframe.style.display = '';
      codeViewer.classList.remove('active');
      iframe.src = currentLive;
      extLink.href = currentLive;
    } else {
      iframe.style.display = 'none';
      codeViewer.classList.add('active');
      extLink.href = currentRepo;
      loadTree();
    }
  }

  document.querySelectorAll('.proj-code-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = btn.closest('.proj-card');
      openModal(card);
      if (currentLive) setTab('code');
    });
  });

  tabPreview.addEventListener('click', function() { setTab('preview'); });
  tabCode.addEventListener('click', function() { setTab('code'); });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

/* ── SCROLL TO TOP ───────────────────────────────── */
(function() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── CONTACT FORM ────────────────────────────────── */
function handleFormSubmit() {
  const btn = document.querySelector('.form-submit');
  btn.textContent = '✓ Message sent!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
  }, 3000);
}

/* ── SMOOTH SCROLL ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
