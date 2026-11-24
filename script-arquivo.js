const filters = document.querySelector('.filters');
const buttons = [...filters.querySelectorAll('button')];
const dishes = [...document.querySelectorAll('.dish')];

function showCategory(category, announce = true) {
  buttons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  dishes.forEach(dish => {
    dish.hidden = dish.dataset.category !== category;
  });
  if (announce) {
    const total = dishes.filter(dish => !dish.hidden).length;
    document.querySelector('#menu-status').textContent =
      category + ' — ' + total + (total === 1 ? ' item' : ' itens');
  }
}

buttons.forEach(button => {
  button.addEventListener('click', () => showCategory(button.dataset.filter));
});
document.querySelectorAll('[data-show]').forEach(link => {
  link.addEventListener('click', () => showCategory(link.dataset.show));
});
showCategory('Burgers', false);
filters.hidden = false;

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    observer.disconnect();
  }, { threshold: 0.2 });
  observer.observe(document.querySelector('.feature-grid'));
}

async function animateBurgerBuild() {
  const section = document.querySelector('.burger-build');
  if (!section) return;

  const stage = section.querySelector('.burger-build-stage');
  const pin = section.querySelector('.burger-build-pin');
  const motion = matchMedia('(min-height: 461px)');
  const layers = [...stage.querySelectorAll('.burger-build-layer')].map(layer => ({
    layer,
    image: layer.querySelector('img'),
    label: layer.querySelector('span')
  }));

  let frame = 0;
  function draw() {
    frame = 0;
    const bounds = section.getBoundingClientRect();
    if (!motion.matches || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

    const travel = Math.max(1, bounds.height - pin.offsetHeight);
    const progress = Math.min(1, Math.max(0, -bounds.top / travel));
    const phase = Math.min(1, progress / .43, (1 - progress) / .43);
    const spread = phase * phase * (3 - 2 * phase);
    const width = layers[0].layer.offsetWidth;
    const height = stage.offsetHeight;
    const opacity = Math.max(0, Math.min(1, (spread - .54) / .36));

    const heights = layers.map(({ image }) => image.offsetHeight);
    const imageHeight = heights.reduce((total, value) => total + value, 0);
    const gap = (height - imageHeight) / (layers.length + 1);
    let openTop = gap - height / 2;

    layers.forEach(({ layer, label }, index) => {
      const closedTop = Number(layer.dataset.center) * width - heights[index] / 2;
      const offset = closedTop + (openTop - closedTop) * spread;
      openTop += heights[index] + gap;
      layer.style.transform = 'translateY(' + offset + 'px)';
      label.style.opacity = opacity;
    });
  }

  try {
    await Promise.all(layers.map(({ image }) => image.decode()));
  } catch {
    return;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  section.classList.add('is-animated');
  stage.setAttribute('aria-hidden', 'true');
  stage.hidden = false;
  draw();
}

animateBurgerBuild();
