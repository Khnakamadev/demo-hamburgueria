(() => {
  const story = document.querySelector('.scroll-story');
  const scene = story.querySelector('.scene');
  const cover = scene.querySelector('img');
  const canvas = scene.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;

  const mast = document.querySelector('.mast');
  const panels = [...scene.querySelectorAll('.scene-panel')].map(element => ({
    element,
    start: Number(element.dataset.start),
    end: Number(element.dataset.end)
  }));
  const hint = scene.querySelector('.scene-hint');
  const progress = scene.querySelector('.scene-progress');
  const fill = progress.firstElementChild;
  const frames = Array(121);
  let pending = false;
  let drawn = -1;
  let next = 0;
  let travel = 1;
  let storyTop = 0;

  function closestFrame(target) {
    for (let offset = 0; offset < frames.length; offset += 1) {
      if (frames[target - offset]) return target - offset;
      if (frames[target + offset]) return target + offset;
    }
    return -1;
  }

  function render() {
    pending = false;
    const position = Math.min(1, Math.max(0, (window.scrollY - storyTop) / travel));
    const frame = closestFrame(Math.round(position * (frames.length - 1)));
    if (frame >= 0 && frame !== drawn) {
      context.drawImage(frames[frame], 0, 0, canvas.width, canvas.height);
      drawn = frame;
      canvas.hidden = false;
    }

    for (const { element, start, end } of panels) {
      const fadeIn = start === 0 ? 1 : (position - start) / .035;
      const fadeOut = end === 1 ? 1 : (end - position) / .035;
      const opacity = Math.max(0, Math.min(1, fadeIn, fadeOut));
      element.hidden = opacity === 0;
      if (!element.hidden) {
        element.style.opacity = opacity;
        element.style.transform = 'translateY(' + (1 - Math.min(1, fadeIn)) * 12 + 'px)';
      }
    }
    fill.style.transform = 'scaleX(' + position + ')';
    hint.hidden = position > .055;
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(render);
  }

  function measure() {
    scene.style.setProperty('--mast-height', mast.offsetHeight + 'px');
    travel = Math.max(1, story.offsetHeight - scene.offsetHeight);
    storyTop = story.getBoundingClientRect().top + window.scrollY;
    schedule();
  }

  async function loadFrames(limit) {
    while (next < limit) {
      const index = next++;
      const image = index === 0 ? cover : new Image();
      if (index !== 0) {
        const number = String(index + 1).padStart(3, '0');
        image.src = 'video/cena/c' + number + '.jpg';
      }
      try {
        await image.decode();
        // Retain smaller decoded frames to limit memory on low-end devices.
        frames[index] = typeof createImageBitmap === 'function'
          ? await createImageBitmap(image, { resizeWidth: canvas.width, resizeHeight: canvas.height })
          : image;
      } catch {
        if (image.complete && image.naturalWidth) frames[index] = image;
      }
      if (story.classList.contains('is-playing')) schedule();
    }
  }

  async function start() {
    await Promise.all([loadFrames(10), loadFrames(10), loadFrames(10)]);
    if (!frames.some(Boolean)) return;
    story.classList.add('is-playing');
    progress.hidden = false;
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(mast);
    await Promise.all([loadFrames(121), loadFrames(121), loadFrames(121)]);
  }

  start();
})();
