/**
 * Shared scroll-linked text fill animation for legacy page exports.
 * Progress is derived from the current scroll position so the fill rewinds
 * naturally when a visitor scrolls back up.
 */
export const scrollFillTextScript = String.raw`(function () {
  function sourceHtml(element) {
    var source = element.getAttribute('data-sf-html');
    if (source != null) return source;
    source = element.innerHTML;
    element.setAttribute('data-sf-html', source);
    return source;
  }

  function buildWords(element) {
    var source = sourceHtml(element);
    if (!source) return;

    var lines = source
      .replace(/<br\s*\/?\s*>/gi, '|BR|')
      .replace(/<[^>]+>/g, '')
      .split('|BR|');
    var markup = [];

    for (var line = 0; line < lines.length; line++) {
      if (line > 0) markup.push('<br>');
      var words = lines[line].replace(/\s+/g, ' ').trim().split(/\s+/);
      if (!words[0]) continue;

      for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
        if (wordIndex > 0) markup.push(' ');
        markup.push('<span class="sf-word" style="transition-delay:' + (wordIndex * 0.04).toFixed(2) + 's">');
        for (var charIndex = 0; charIndex < words[wordIndex].length; charIndex++) {
          var character = words[wordIndex][charIndex];
          var escaped = character === '&' ? '&amp;' : character === '<' ? '&lt;' : character === '>' ? '&gt;' : character;
          markup.push('<span class="sf-char">' + escaped + '</span>');
        }
        markup.push('</span>');
      }
    }

    element.innerHTML = markup.join('');
  }

  var GREY = [154, 154, 154];
  var MUSTARD = [239, 180, 7];
  var BLACK = [21, 21, 21];
  var BAND_CHARS = 3;
  var SETTLE_SPEED = 3;
  var SCROLL_GRACE_MS = 90;
  var COMPLETE_DISTANCE = 520;
  var records = [];
  var running = false;
  var lastScroll = -1e9;
  var lastFrame = 0;

  function mix(from, to, amount) {
    return [
      from[0] + (to[0] - from[0]) * amount,
      from[1] + (to[1] - from[1]) * amount,
      from[2] + (to[2] - from[2]) * amount,
    ];
  }

  function cssColor(color) {
    return 'rgb(' + Math.round(color[0]) + ',' + Math.round(color[1]) + ',' + Math.round(color[2]) + ')';
  }

  function smooth(amount) {
    return amount * amount * (3 - 2 * amount);
  }

  var wordObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        for (var index = 0; index < entries.length; index++) {
          if (!entries[index].isIntersecting) continue;
          entries[index].target.classList.add('sf-fw-in');
          wordObserver.unobserve(entries[index].target);
        }
      }, { rootMargin: '0px 0px -10% 0px' })
    : null;

  function collect() {
    var elements = document.querySelectorAll('[text-fill-scroll]');
    var nextRecords = [];

    for (var index = 0; index < elements.length; index++) {
      var element = elements[index];
      var previous = null;
      for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
        if (records[recordIndex].element === element) {
          previous = records[recordIndex];
          break;
        }
      }

      buildWords(element);
      if (wordObserver) wordObserver.observe(element);
      else element.classList.add('sf-fw-in');

      if (previous) {
        previous.last = [];
        previous.settle = null;
      }
      nextRecords.push(previous || { element: element, anchor: null, last: [], settle: null });
    }

    records = nextRecords;
  }

  function frame(now) {
    var delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    var active = now - lastScroll < SCROLL_GRACE_MS;
    var viewportHeight = window.innerHeight;
    var scrollY = window.scrollY || window.pageYOffset;
    var busy = false;

    for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
      var record = records[recordIndex];
      var element = record.element;
      var characters = element.querySelectorAll('.sf-char');
      var characterCount = characters.length;
      if (!characterCount) continue;

      if (!record.settle || record.settle.length !== characterCount) {
        record.settle = new Float32Array(characterCount);
        record.last = [];
      }

      var rect = element.getBoundingClientRect();
      var startY = viewportHeight * 0.72;
      if (record.anchor == null && rect.top <= startY && rect.bottom > -200) record.anchor = scrollY;

      // Recompute from current scroll position so the fill reverses on upward scroll.
      var progress = record.anchor == null
        ? 0
        : Math.max(0, Math.min(1, (scrollY - record.anchor) / COMPLETE_DISTANCE));
      var bandDuration = Math.max(0.01, Math.min(0.9, BAND_CHARS / characterCount));

      for (var characterIndex = 0; characterIndex < characterCount; characterIndex++) {
        var bandStart = (characterIndex / Math.max(characterCount - 1, 1)) * (1 - bandDuration);
        var reveal = Math.max(0, Math.min(1, (progress - bandStart) / bandDuration));
        if (reveal <= 0) {
          var grey = cssColor(GREY);
          record.settle[characterIndex] = 0;
          if (record.last[characterIndex] !== grey) {
            record.last[characterIndex] = grey;
            characters[characterIndex].style.setProperty('--sfw', grey);
          }
          continue;
        }

        // Fully revealed characters settle to black after scrolling pauses.
        // As the reveal recedes on upward scroll, this settle value unwinds too.
        var targetSettle = reveal >= 1 || !active ? 1 : 0;
        var settle = record.settle[characterIndex];
        if (settle < targetSettle) {
          settle = Math.min(targetSettle, settle + SETTLE_SPEED * delta);
          busy = true;
        } else if (settle > targetSettle) {
          settle = Math.max(targetSettle, settle - SETTLE_SPEED * delta);
          busy = true;
        }
        record.settle[characterIndex] = settle;

        var color = cssColor(mix(mix(GREY, MUSTARD, reveal), BLACK, smooth(settle)));
        if (record.last[characterIndex] !== color) {
          record.last[characterIndex] = color;
          characters[characterIndex].style.setProperty('--sfw', color);
        }
      }
    }

    if (active || busy) requestAnimationFrame(frame);
    else running = false;
  }

  function ensureFrame() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function onScroll() {
    lastScroll = performance.now();
    ensureFrame();
  }

  function start() {
    collect();
    setTimeout(function () {
      collect();
      ensureFrame();
    }, 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    ensureFrame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 300); });
  } else {
    setTimeout(start, 300);
  }
})();`;
