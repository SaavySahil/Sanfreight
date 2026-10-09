/**
 * Shared scroll-linked text fill animation for legacy page exports.
 * Progress and color are derived from scroll position so the fill follows the
 * same path and speed in either direction.
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
  var SCROLL_GRACE_MS = 90;
  var COMPLETE_DISTANCE = 520;
  var records = [];
  var running = false;
  var lastScroll = -1e9;

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

      var rect = element.getBoundingClientRect();
      var anchor = rect.width && rect.height
        ? (window.scrollY || window.pageYOffset) + rect.top - window.innerHeight * 0.72
        : null;

      if (previous) {
        previous.last = [];
        if (previous.anchor == null) previous.anchor = anchor;
      }
      nextRecords.push(previous || { element: element, anchor: anchor, last: [] });
    }

    records = nextRecords;
  }

  function frame(now) {
    var active = now - lastScroll < SCROLL_GRACE_MS;
    var scrollY = window.scrollY || window.pageYOffset;

    for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
      var record = records[recordIndex];
      var element = record.element;
      var characters = element.querySelectorAll('.sf-char');
      var characterCount = characters.length;
      if (!characterCount) continue;

      if (record.anchor == null) {
        var rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        record.anchor = scrollY + rect.top - window.innerHeight * 0.72;
      }

      // Scroll position is the sole animation state, so both directions share
      // the same colors and speed at every point in the reveal.
      var progress = Math.max(0, Math.min(1, (scrollY - record.anchor) / COMPLETE_DISTANCE));
      var bandDuration = Math.max(0.01, Math.min(0.9, BAND_CHARS / characterCount));

      for (var characterIndex = 0; characterIndex < characterCount; characterIndex++) {
        var bandStart = (characterIndex / Math.max(characterCount - 1, 1)) * (1 - bandDuration);
        var reveal = Math.max(0, Math.min(1, (progress - bandStart) / bandDuration));
        var trail = Math.max(0, Math.min(1, (progress - bandStart - bandDuration) / bandDuration));
        var color = cssColor(mix(mix(GREY, MUSTARD, reveal), BLACK, smooth(trail)));
        if (record.last[characterIndex] !== color) {
          record.last[characterIndex] = color;
          characters[characterIndex].style.setProperty('--sfw', color);
        }
      }
    }

    if (active) requestAnimationFrame(frame);
    else running = false;
  }

  function ensureFrame() {
    if (running) return;
    running = true;
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
