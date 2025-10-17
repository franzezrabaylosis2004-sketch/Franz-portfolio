(function(){
  // Site behavior: intersection animations, hover effects, navigation and hamburger menu
  // Defensive: all DOM operations check for element existence to avoid errors on pages

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    });
  }

  // Project card hover effects
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // Highlight cards hover effects
  document.querySelectorAll('.highlight-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // DOM ready initialization
  document.addEventListener('DOMContentLoaded', async () => {
    // Initialize navigation and hamburger menu (if present)
    try { initializeHamburgerMenu(); } catch (e) { /* ignore */ }

    // Restore active skill tags from localStorage
    const activeSkills = JSON.parse(localStorage.getItem('activeSkills') || '[]');
    document.querySelectorAll('.skill-tag').forEach(tag => {
      if (activeSkills.includes(tag.textContent)) {
        tag.classList.add('active');
      }
    });

    // Add click listeners to skill tags for active state with persistence
    document.querySelectorAll('.skill-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        tag.classList.toggle('active');
        const activeTags = [];
        document.querySelectorAll('.skill-tag.active').forEach(activeTag => {
          activeTags.push(activeTag.textContent);
        });
        localStorage.setItem('activeSkills', JSON.stringify(activeTags));
      });
    });

    // Add click listener to "View Code" link to open with small delay
    const viewCodeLink = document.querySelector('.project-links a.btn-outline');
    if (viewCodeLink) {
      viewCodeLink.addEventListener('click', (e) => {
        e.preventDefault();
        setTimeout(() => {
          window.open(viewCodeLink.href, '_blank');
        }, 100);
      });
    }
  });

  // Run some init on load as well
  window.addEventListener('load', () => {
    try { initializeNavigation(); } catch (e) { /* ignore */ }
    try { initializeHamburgerMenu(); } catch (e) { /* ignore */ }
  });

  // Smooth scrolling nav and other navigation behaviors
  function initializeNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('#nav-menu a').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href;
          const targetSection = document.querySelector(targetId);

          if (targetSection) {
            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }

          // Update active classes
          document.querySelectorAll('#nav-menu a').forEach(link => link.classList.remove('active'));
          this.classList.add('active');

          // Close the hamburger menu after clicking a link
          const hamburger = document.getElementById('hamburger');
          const navMenu = document.getElementById('nav-menu');
          if (hamburger && navMenu) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.querySelector('.dropdown-menu.active')?.classList.remove('active');
          }
        }
      });
    });

    // Dropdown toggle for mobile
    document.querySelectorAll('.dropdown > a').forEach(dropdownLink => {
      dropdownLink.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          const dropdownMenu = this.nextElementSibling;
          if (this.getAttribute('href') !== 'javascript:void(0)') {
            e.preventDefault();
          }
          if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
            dropdownMenu.classList.toggle('active');
          }
        }
      });
    });

    // Header background change on scroll
    window.addEventListener('scroll', () => {
      const header = document.getElementById('header');
      if (!header) return;
      const scrollY = window.scrollY;
      if (scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    });

    // Initialize scroll-based active navigation
    initializeScrollNavigation();
  }

  // Initialize hamburger menu with improved mobile handling
  function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;

    if (!hamburger || !navMenu) {
      // nothing to do if markup is not present
      return;
    }

    // Replace node to clear listeners
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);

    newHamburger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
      body.classList.toggle('menu-open');

      if (navMenu.classList.contains('active')) {
        navMenu.style.display = 'block';
        navMenu.style.right = '0';
      } else {
        navMenu.style.right = '-100%';
        setTimeout(() => {
          if (!navMenu.classList.contains('active')) navMenu.style.display = 'none';
        }, 300);
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!newHamburger.contains(e.target) && !navMenu.contains(e.target)) {
        newHamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        navMenu.style.right = '-100%';
        setTimeout(() => {
          if (!navMenu.classList.contains('active')) navMenu.style.display = 'none';
        }, 300);
      }
    });

    // Prevent clicks inside menu from closing it
    navMenu.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  // Initialize scroll-based active navigation
  function initializeScrollNavigation() {
    const navLinks = document.querySelectorAll('#nav-menu a');
    const sections = document.querySelectorAll('section[id]');
    if (!navLinks.length || !sections.length) return;

    const navObserverOptions = { threshold: 0.5, rootMargin: '-50% 0px -50% 0px' };
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
          });
        }
      });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));
  }

  // Close mobile dropdown on window resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.getElementById('nav-menu')?.classList.remove('active');
      document.getElementById('hamburger')?.classList.remove('active');
      document.querySelector('.dropdown-menu.active')?.classList.remove('active');
    }
  });

})();
