(function () {
  function waitForImages(track) {
    var images = Array.prototype.slice.call(track.querySelectorAll('img'));
    if (!images.length) return Promise.resolve();

    images.forEach(function (img) {
      img.loading = 'eager';
    });

    return Promise.all(images.map(function (img) {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      if (img.decode) {
        return img.decode().catch(function () {});
      }
      return new Promise(function (resolve) {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  }

  function cloneTrack(track, trackSelector) {
    if (!track || track.dataset.inited === '1' || track.dataset.pending === '1') return;
    track.dataset.pending = '1';

    waitForImages(track).then(function () {
      track.dataset.pending = '';
      cloneReadyTrack(track);
    });
  }

  function cloneReadyTrack(track) {
    if (!track || track.dataset.inited === '1') return;

    var marquee = track.parentElement;
    if (!marquee) return;

    var seedHTML = track.innerHTML;
    if (!seedHTML.trim()) return;

    var ghost = document.createElement('div');
    ghost.className = track.className;
    ghost.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;';
    ghost.innerHTML = seedHTML;
    marquee.appendChild(ghost);
    var seedW = ghost.scrollWidth || track.scrollWidth;
    marquee.removeChild(ghost);

    if (!seedW) return;

    track.dataset.inited = '1';
    track.style.setProperty('--loop-w', seedW + 'px');
    track.insertAdjacentHTML('beforeend', seedHTML);

    while (track.scrollWidth < marquee.clientWidth + seedW) {
      track.insertAdjacentHTML('beforeend', seedHTML);
    }

    // Force animation restart for browsers that computed it before --loop-w was set.
    track.style.animation = 'none';
    track.offsetHeight;
    track.style.animation = '';
  }

  function initPartnersMarquee() {
    document.querySelectorAll('.partners__track').forEach(function (track) {
      cloneTrack(track, '.partners__track');
    });
    document.querySelectorAll('.ptT[data-ptt="1"] .ptT__track').forEach(function (track) {
      cloneTrack(track, '.ptT__track');
    });
    document.querySelectorAll('.ptM2[data-ptm="1"] .ptM2__track').forEach(function (track) {
      cloneTrack(track, '.ptM2__track');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPartnersMarquee, { once: true });
  } else {
    initPartnersMarquee();
  }

  window.addEventListener('load', initPartnersMarquee, { once: true });
  window.addEventListener('resize', function () {
    window.clearTimeout(window.__allnrgPartnersResize);
    window.__allnrgPartnersResize = window.setTimeout(initPartnersMarquee, 150);
  });
})();
