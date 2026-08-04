// ============================================================
//  PAGE-SPECIFIC JUMP-SCARE  — 0.5 s, GPU-accelerated, no lag
//  • Home page    → horror close-up woman face
//  • Contact page → dark ghost woman with long hair
//  • All others   → nothing
// ============================================================
(function () {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  // Decide which image to use (null = no scare)
  let scareImg = null;
  if (page === 'index.html' || page === '' || page === '/') {
    scareImg = 'scare-home.png';          // dark ghost woman — home page
  } else if (page === 'about.html') {
    scareImg = 'scare-about.png';         // white-eyed woman — about page
  } else if (page === 'contact.html') {
    scareImg = 'scare-contact.png';       // dark ghost woman — contact page
  }

  if (!scareImg) return;                  // other pages — do nothing

  const TOTAL_MS = 800;                   // 0.8 seconds

  /* Inject CSS — only transform + opacity → runs on GPU, NO layout reflow */
  const style = document.createElement('style');
  style.textContent = `
    #gs-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      will-change: opacity;
      animation: gsOverlay ${TOTAL_MS}ms ease-in-out forwards;
    }
    #gs-ghost {
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      object-position: center;
      will-change: transform, opacity;
      animation: gsGhost ${TOTAL_MS}ms ease-in-out forwards;
    }
    @keyframes gsOverlay {
      0%   { opacity: 1; }
      70%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes gsGhost {
      0%   { transform: scale3d(0.6,0.6,1); opacity: 0; }
      25%  { transform: scale3d(1.05,1.05,1); opacity: 1; }
      70%  { transform: scale3d(1,1,1);       opacity: 1; }
      100% { transform: scale3d(1.4,1.4,1);   opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  /* Build overlay */
  const overlay = document.createElement('div');
  overlay.id = 'gs-overlay';

  const img = document.createElement('img');
  img.id            = 'gs-ghost';
  img.src           = scareImg;
  img.alt           = '';
  img.decoding      = 'async';
  img.setAttribute('aria-hidden', 'true');

  overlay.appendChild(img);

  const attach = () => document.body.appendChild(overlay);
  if (document.body) { attach(); }
  else { document.addEventListener('DOMContentLoaded', attach); }

  /* Remove completely once done */
  setTimeout(() => { overlay.remove(); style.remove(); }, TOTAL_MS + 60);
})();

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('main-header');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-links a, .footer-nav a');
  const sections = document.querySelectorAll('section');

  // Set active link based on current page filename
  const currentPath = window.location.pathname;
  let onSubpage = false;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href) && href !== 'index.html' && href !== '') {
      link.classList.add('active');
      onSubpage = true;
    } else {
      link.classList.remove('active');
    }
  });

  // Sticky Header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });

  // Mobile Nav Toggle
  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      
      // Animate hamburger toggle spans
      const spans = navToggle.querySelectorAll('span');
      if (navLinksContainer.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // Active Link Highlighter on Scroll (only for homepage)
  if (!onSubpage) {
    // Set HOME active by default on homepage top
    const homeLink = document.querySelector('.nav-links a[href="index.html"]');
    if (homeLink) homeLink.classList.add('active');

    // Map section IDs to nav hrefs
    const sectionNavMap = {
      'hero':    'index.html',
      'about':   'index.html',
      'program': 'program.html',
      'tickets': 'tickets.html',
      'contact': 'contact.html'
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const targetHref = sectionNavMap[id];
          if (!targetHref) return;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === targetHref) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => {
      if (section.getAttribute('id')) {
        observer.observe(section);
      }
    });
  }

  // Parallax scrolling on the hero background (if present)
  const heroSection = document.getElementById('hero');
  window.addEventListener('scroll', () => {
    if (heroSection) {
      const scrollPos = window.scrollY;
      heroSection.style.backgroundPositionY = `${scrollPos * 0.4}px`;
    }
  });

  // FAQ Accordion click handler
  const faqHeaders = document.querySelectorAll('.faq-header');
  faqHeaders.forEach(faqHeader => {
    faqHeader.addEventListener('click', () => {
      const faqItem = faqHeader.parentElement;
      const isActive = faqItem.classList.contains('active');
      
      // Close all accordion rows first
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const content = item.querySelector('.faq-content');
        if (content) {
          content.style.maxHeight = null;
        }
      });
      
      // Open current row if it wasn't active
      if (!isActive) {
        faqItem.classList.add('active');
        const content = faqItem.querySelector('.faq-content');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });

  // Auto-cycling ALL Gallery Images every 2 seconds
  document.querySelectorAll('.gallery-grid').forEach(galleryGrid => {
    const items = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
    if (items.length < 2) return;

    const FADE_MS = 250;   // fade out/in duration
    const HOLD_MS = 2000;  // time each arrangement is shown

    // Collect all images and titles once
    const imgs   = items.map(item => item.querySelector('img'));
    const titles = items.map(item => item.querySelector('.gallery-info h4'));

    // Apply fast CSS transition once
    imgs.forEach(img => {
      if (img) img.style.transition = `opacity ${FADE_MS}ms ease`;
    });
    titles.forEach(t => {
      if (t) t.style.transition = `opacity ${FADE_MS}ms ease`;
    });

    setInterval(() => {
      // Step 1 — fade everything out
      imgs.forEach(img   => { if (img)   img.style.opacity = '0'; });
      titles.forEach(t   => { if (t)     t.style.opacity   = '0'; });

      setTimeout(() => {
        // Step 2 — rotate: last item's data moves to first, each shifts one forward
        const lastSrc   = imgs[imgs.length - 1]   ? imgs[imgs.length - 1].src   : '';
        const lastAlt   = imgs[imgs.length - 1]   ? imgs[imgs.length - 1].alt   : '';
        const lastTitle = titles[titles.length - 1] ? titles[titles.length - 1].textContent : '';

        for (let i = items.length - 1; i > 0; i--) {
          if (imgs[i] && imgs[i - 1]) {
            imgs[i].src = imgs[i - 1].src;
            imgs[i].alt = imgs[i - 1].alt;
          }
          if (titles[i] && titles[i - 1]) {
            titles[i].textContent = titles[i - 1].textContent;
          }
        }

        // Wrap last into first slot
        if (imgs[0])   { imgs[0].src = lastSrc;   imgs[0].alt = lastAlt; }
        if (titles[0]) { titles[0].textContent = lastTitle; }

        // Step 3 — fade everything back in
        imgs.forEach(img => { if (img) img.style.opacity = '1'; });
        titles.forEach(t => { if (t)   t.style.opacity   = '1'; });
      }, FADE_MS);

    }, HOLD_MS);
  });
});
