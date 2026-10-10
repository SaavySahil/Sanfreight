/**
 * Shared scroll-linked text fill animation for legacy page exports.
 * Progress and color are derived from the element's visual position so the
 * fill stays synchronized with the site's smoothed scrolling in either direction.
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

  // New targets can already be wrapped by the site's reveal animation or
  // contain inline spans. Wrap their existing text nodes in place so those
  // animation targets and formatting remain intact.
  var pendingRevealObservers = typeof WeakMap === 'function' ? new WeakMap() : null;

  function waitForRevealSplit(element) {
    if (!pendingRevealObservers || typeof MutationObserver !== 'function') return false;
    if (pendingRevealObservers.has(element)) return true;

    var observer = new MutationObserver(function () {
      if (!element.querySelector('.word')) return;
      observer.disconnect();
      pendingRevealObservers.delete(element);
      buildPreservedChars(element);
      ensureFrame();
    });
    pendingRevealObservers.set(element, observer);
    observer.observe(element, { childList: true, subtree: true });
    return true;
  }

  function buildPreservedChars(element) {
    if (element.querySelector('.sf-char')) return true;

    var animation = element.getAttribute('data-animation') || '';
    var rect = element.getBoundingClientRect();
    var outsideViewport = rect.bottom <= 0 || rect.top >= window.innerHeight;
    if (/reveal-words/i.test(animation) && outsideViewport && !element.querySelector('.word')) {
      if (waitForRevealSplit(element)) return false;
    }

    var walker = document.createTreeWalker(element, 4);
    var textNodes = [];
    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (!node.nodeValue || !node.nodeValue.length) continue;
      var parent = node.parentElement;
      if (!parent || parent.closest('script, style, .sf-char')) continue;
      textNodes.push(node);
    }

    for (var nodeIndex = 0; nodeIndex < textNodes.length; nodeIndex++) {
      var textNode = textNodes[nodeIndex];
      var characters = Array.from(textNode.nodeValue || '');
      var fragment = document.createDocumentFragment();
      var whitespace = '';
      for (var characterIndex = 0; characterIndex < characters.length; characterIndex++) {
        if (/\s/.test(characters[characterIndex])) {
          whitespace += characters[characterIndex];
          continue;
        }
        if (whitespace) {
          fragment.appendChild(document.createTextNode(whitespace));
          whitespace = '';
        }
        var character = document.createElement('span');
        character.className = 'sf-char';
        character.textContent = characters[characterIndex];
        fragment.appendChild(character);
      }
      if (whitespace) fragment.appendChild(document.createTextNode(whitespace));
      if (textNode.parentNode) textNode.parentNode.replaceChild(fragment, textNode);
    }
    return true;
  }

  var GREY = [154, 154, 154];
  var MUSTARD = [239, 180, 7];
  var BLACK = [21, 21, 21];
  var WHITE = [255, 255, 255];
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

  function translateX(element) {
    var transform = window.getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 0;

    var values = transform.slice(transform.indexOf('(') + 1, -1).split(',');
    var x = transform.indexOf('matrix3d(') === 0 ? values[12] : values[4];
    return Number(x) || 0;
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
      var preserveTextMarkup = element.hasAttribute('data-sf-fill-preserve');
      var fillEndColor = element.getAttribute('data-sf-fill-end') === 'white' ? WHITE : BLACK;
      var previous = null;
      var homeServices = element.closest('#sf-home-services');
      var horizontalScroller = homeServices && homeServices.querySelector('.horizontal-wrapper');
      for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
        if (records[recordIndex].element === element) {
          previous = records[recordIndex];
          break;
        }
      }

      if (preserveTextMarkup) {
        buildPreservedChars(element);
      } else {
        buildWords(element);
        if (wordObserver) wordObserver.observe(element);
        else element.classList.add('sf-fw-in');
      }

      if (previous) {
        previous.fillEndColor = fillEndColor;
        previous.last = [];
        previous.lastTop = null;
        previous.lastLeft = null;
        previous.lastScrollerLeft = null;
      }
      nextRecords.push(previous || {
        element: element,
        last: [],
        lastTop: null,
        lastLeft: null,
        lastScrollerLeft: null,
        fillEndColor: fillEndColor,
        horizontalScroller: horizontalScroller,
        horizontalStartLeft: horizontalScroller
          ? horizontalScroller.getBoundingClientRect().left - translateX(horizontalScroller)
          : null,
      });
    }

    records = nextRecords;
  }

  function frame(now) {
    var active = now - lastScroll < SCROLL_GRACE_MS;
    var moving = false;

    for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
      var record = records[recordIndex];
      var element = record.element;
      var characters = element.querySelectorAll('.sf-char');
      var characterCount = characters.length;
      if (!characterCount) continue;

      var rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (record.lastTop != null && Math.abs(rect.top - record.lastTop) > 0.01) moving = true;
      if (record.lastLeft != null && Math.abs(rect.left - record.lastLeft) > 0.01) moving = true;
      record.lastTop = rect.top;
      record.lastLeft = rect.left;

      // Measure rendered position instead of window.scrollY because the legacy
      // page smooth-scrolls #smooth-content with a transform. The homepage
      // services section also pins and translates its track horizontally, so
      // include that travel in the same scroll distance. This keeps the fill
      // moving through the pin and retraces it on reverse scroll.
      var scrollDistance = window.innerHeight * 0.72 - rect.top;
      if (record.horizontalScroller) {
        var scrollerLeft = record.horizontalScroller.getBoundingClientRect().left;
        if (record.lastScrollerLeft != null && Math.abs(scrollerLeft - record.lastScrollerLeft) > 0.01) moving = true;
        record.lastScrollerLeft = scrollerLeft;
        scrollDistance += Math.max(0, record.horizontalStartLeft - scrollerLeft);
      }
      var progress = Math.max(0, Math.min(1, scrollDistance / COMPLETE_DISTANCE));
      var bandDuration = Math.max(0.01, Math.min(0.9, BAND_CHARS / characterCount));

      for (var characterIndex = 0; characterIndex < characterCount; characterIndex++) {
        var bandStart = (characterIndex / Math.max(characterCount - 1, 1)) * Math.max(0, 1 - 2 * bandDuration);
        var reveal = Math.max(0, Math.min(1, (progress - bandStart) / bandDuration));
        var trail = Math.max(0, Math.min(1, (progress - bandStart - bandDuration) / bandDuration));
        var color = cssColor(mix(mix(GREY, MUSTARD, reveal), record.fillEndColor, smooth(trail)));
        if (record.last[characterIndex] !== color) {
          record.last[characterIndex] = color;
          characters[characterIndex].style.setProperty('--sfw', color);
        }
      }
    }

    // Keep sampling while the smooth-scroll transform is still moving, even
    // after native scroll events stop firing.
    if (active || moving) requestAnimationFrame(frame);
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

export const scrollFillPreserveStyle = `
  [text-fill-scroll][data-sf-fill-preserve] .sf-char {
    color: var(--sfw, #9a9a9a) !important;
    -webkit-text-fill-color: var(--sfw, #9a9a9a) !important;
  }
`;
