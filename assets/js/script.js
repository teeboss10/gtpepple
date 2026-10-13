document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('site-loader');
  const welcome = document.getElementById('welcome');
  const form = document.getElementById('welcome-form');
  const success = document.getElementById('welcome-success');
  const welcomeCloseButtons = document.querySelectorAll('[data-welcome-close]');

  if (loader && welcome && form && success) {
    let previousFocus;
    const submissionKey = 'pepple-welcome-submitted';
    const submissionEndpoint = 'https://formsubmit.co/ajax/tonye.benjamin000@gmail.com';

    function closeWelcome() {
      welcome.hidden = true;
      document.body.classList.remove('welcome-open');
      if (previousFocus) previousFocus.focus();
    }

    function showWelcome() {
      loader.classList.add('is-done');
      try {
        if (window.localStorage.getItem(submissionKey) === 'true') return;
      } catch (error) { }
      window.setTimeout(() => {
        welcome.hidden = false;
        document.body.classList.add('welcome-open');
        previousFocus = document.activeElement;
        document.getElementById('welcome-name').focus();
      }, 400);
    }

    welcomeCloseButtons.forEach((button) => button.addEventListener('click', closeWelcome));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !welcome.hidden) closeWelcome();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      const name = new FormData(form).get('name').trim();
      submitButton.disabled = true;
      form.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(submissionEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            name,
            email: new FormData(form).get('email'),
            phone: new FormData(form).get('phone'),
            _subject: 'Pepple for NIS Chairman campaign signup'
          })
        });
        const result = await response.json();

        if (!response.ok || result.success === false || result.success === 'false') {
          throw new Error('The signup could not be sent. Please try again.');
        }

        try {
          window.localStorage.setItem(submissionKey, 'true');
        } catch (error) { }
        success.textContent = `Thanks, ${name}. Your details have been sent. On election day, remember to vote for Pepple for NIS Chairman.`;
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (error) {
        success.textContent = error.message || 'The signup could not be sent. Please check your connection and try again.';
        success.hidden = false;
        success.focus();
      } finally {
        submitButton.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });

    if (document.readyState === 'complete') showWelcome();
    else window.addEventListener('load', showWelcome, { once: true });
  }

  const menu = document.getElementById('m');
  const menuToggle = document.querySelector('.burger');
  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  let comingSoonTimer;
  document.querySelectorAll('.dice-game-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      let notice = document.getElementById('coming-soon-notice');

      if (!notice) {
        notice = document.createElement('div');
        notice.id = 'coming-soon-notice';
        notice.className = 'coming-soon-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        document.body.append(notice);
      }

      notice.textContent = 'Dice Game coming soon.';
      notice.classList.add('is-visible');
      window.clearTimeout(comingSoonTimer);
      comingSoonTimer = window.setTimeout(() => notice.classList.remove('is-visible'), 3000);
    });
  });

  const revealElements = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('in'));
  }

  const progressBar = document.getElementById('bar');
  const header = document.getElementById('hd');
  if (progressBar && header) {
    function updateScrollState() {
      const documentElement = document.documentElement;
      const scrollableHeight = documentElement.scrollHeight - documentElement.clientHeight;
      progressBar.style.width = `${scrollableHeight > 0 ? documentElement.scrollTop / scrollableHeight * 100 : 0}%`;
      header.classList.toggle('sc', documentElement.scrollTop > 10);
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
  }

  const downloadButtons = document.querySelectorAll('.dl');
  const downloadHint = document.getElementById('hint');
  if (downloadButtons.length && downloadHint) {
    function disableDownloads() {
      downloadButtons.forEach((button) => { button.style.display = 'none'; });
      downloadHint.style.display = 'block';
    }

    function decodeDataUrl(source) {
      const encodedData = source.split(',')[1];
      const binary = atob(encodedData);
      return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    }

    if (!window.claude || !window.claude.use) {
      disableDownloads();
    } else {
      window.claude.use('downloads').then((downloads) => {
        if (!downloads) {
          disableDownloads();
          return;
        }
        downloadButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const image = button.closest('.fc').querySelector('img');
            const originalLabel = button.textContent;
            const imageData = new Blob([decodeDataUrl(image.src)], { type: 'image/jpeg' });
            downloads.save({ filename: image.getAttribute('data-f'), data: imageData })
              .then(() => { button.textContent = 'Saved'; })
              .catch((error) => {
                if (error && error.code !== 'declined') button.textContent = 'Unavailable';
              })
              .then(() => window.setTimeout(() => { button.textContent = originalLabel; }, 2200));
          });
        });
      }).catch(disableDownloads);
    }
  }

  const whatsappToggle = document.getElementById('wa-toggle');
  const whatsappPanel = document.getElementById('wa-panel');
  if (whatsappToggle && whatsappPanel) {
    const whatsappClose = whatsappPanel.querySelector('.wa-close');

    function setWhatsappOpen(isOpen) {
      whatsappPanel.hidden = !isOpen;
      whatsappPanel.setAttribute('aria-hidden', String(!isOpen));
      whatsappToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) whatsappClose.focus();
      else whatsappToggle.focus();
    }

    whatsappToggle.addEventListener('click', () => setWhatsappOpen(whatsappPanel.hidden));
    whatsappClose.addEventListener('click', () => setWhatsappOpen(false));
    document.querySelectorAll('.wa-trigger').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setWhatsappOpen(true);
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !whatsappPanel.hidden) setWhatsappOpen(false);
    });
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest && event.target.closest('.wa-trigger');
      if (!whatsappPanel.hidden && !whatsappPanel.contains(event.target) && !whatsappToggle.contains(event.target) && !trigger) {
        setWhatsappOpen(false);
      }
    });
  }
});
