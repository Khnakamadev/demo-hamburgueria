const filters = document.querySelector('.filters');
const buttons = [...filters.querySelectorAll('button')];
const dishes = [...document.querySelectorAll('.dish')];
const status = document.querySelector('#menu-status');

function showCategory(category, announce = true) {
  buttons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  let total = 0;
  dishes.forEach(dish => {
    dish.hidden = dish.dataset.category !== category;
    if (!dish.hidden) total += 1;
  });
  if (announce) status.textContent = category + ' — ' + total + (total === 1 ? ' item' : ' itens');
}

buttons.forEach(button => {
  button.addEventListener('click', () => showCategory(button.dataset.filter));
});
showCategory(buttons[0].dataset.filter, false);
filters.hidden = false;

