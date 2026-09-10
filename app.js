/* define our wide breakpoint for the desktop video - this must match the CSS and preloads! */
const WIDE_VIEWPORT = 480;
/* define a match on the media query for us to share logic with CSS in JS */
const wideViewport = window.matchMedia(`(min-width: ${WIDE_VIEWPORT}px)`)
/* define a minimum downlink bandwidth to show the video */
const MIN_DOWNLINK = 1; // Slow 3G ~~ 0.4, Fast 3G ~~ 1.4

function resizeVideo(wideViewport) {
  let videoEl = document.getElementById("hero-video");
  // default to mobile video source and poster
  let src = videoEl.dataset.mobileSrc;
  let poster = videoEl.dataset.mobilePoster;
  let widthDisplay = 'MOBILE';
  if (wideViewport.matches) {
    // override for desktop if the media query for a wide vieport matches
    src = videoEl.dataset.desktopSrc;
    poster = videoEl.dataset.desktopPoster;
    widthDisplay = 'DESKTOP';
  }
  let downlink = MIN_DOWNLINK;
  try {
    downlink = navigator.connection.downlink;
  } catch (e) {
    console.log(`Unable to determine downlink`)
  }
  if (videoEl.src !== src) {
    // only override values if they differ
    if (downlink >= MIN_DOWNLINK) {
      videoEl.src = src;
      widthDisplay += " - FAST";
      console.log(`Detected bandwidth (${downlink}Mbps) greater than threshold (${MIN_DOWNLINK}Mbps) - showing video`);
    } else {
      widthDisplay += " - SLOW";
      console.log(`Not showing video due to low bandwidth`);
    }
    videoEl.poster = poster;
  }
  document.getElementById('width-display').textContent = widthDisplay;
}

wideViewport.addListener(resizeVideo)
resizeVideo(wideViewport)

/* Accessible sidebar controls with animations */
const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menuButton');
const closeButton = document.getElementById('closeButton');

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled'));
}

function onKeyDown(e) {
  if (e.key === 'Escape') hideSidebar();
}

function showSidebar() {
  if (!sidebar) return;
  if (sidebar.classList.contains('sidebar--open')) return;
  // make visible so animation can run
  sidebar.style.display = 'flex';
  sidebar.classList.remove('sidebar--closing');
  // next frame add open class
  requestAnimationFrame(() => {
    sidebar.classList.add('sidebar--open');
    sidebar.setAttribute('aria-hidden', 'false');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeyDown);
    const focusables = getFocusableElements(sidebar);
    (focusables[0] || closeButton || sidebar).focus();
  });
}

function hideSidebar() {
  if (!sidebar) return;
  if (!sidebar.classList.contains('sidebar--open')) return;
  sidebar.classList.remove('sidebar--open');
  sidebar.classList.add('sidebar--closing');
  sidebar.setAttribute('aria-hidden', 'true');
  if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  document.removeEventListener('keydown', onKeyDown);

  function finishClose(e) {
    // listen for the closing animation to finish
    if (e && e.animationName && e.animationName.indexOf('rubberClose') === -1) return;
    sidebar.style.display = 'none';
    sidebar.classList.remove('sidebar--closing');
    sidebar.removeEventListener('animationend', finishClose);
    if (menuButton) menuButton.focus();
  }

  sidebar.addEventListener('animationend', finishClose);
}

// expose to global for inline handlers
window.showSidebar = showSidebar;
window.hideSidebar = hideSidebar;

// Progressive enhancement: attach listeners
document.addEventListener('DOMContentLoaded', () => {
  if (menuButton) menuButton.addEventListener('click', (e) => { e.preventDefault(); showSidebar(); });
  if (closeButton) closeButton.addEventListener('click', (e) => { e.preventDefault(); hideSidebar(); });
  if (sidebar) {
    sidebar.style.display = 'none';
    sidebar.setAttribute('aria-hidden', 'true');
  }
});