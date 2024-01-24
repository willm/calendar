function highlightCurrentTime(today) {
  const day = today.getDay() + 1;
  const dayHeaderCells = document.querySelectorAll(
    `thead > tr > th:nth-child(${day})`
  );
  const dayCells = document.querySelectorAll(
    `tbody > tr > td:nth-child(${day})`
  );

  document
    .querySelector(
      `tbody > tr:nth-child(${today.getHours() + 1}) > td:nth-child(${day})`
    )
    .classList.toggle('current-time');
  Array.from(dayHeaderCells)
    .concat(Array.from(dayCells))
    .forEach((e) => e.classList.toggle('current-day'));
}

function main() {
  const today = new Date();
  highlightCurrentTime(today);
  console.log(today.getHours());
}

main();
