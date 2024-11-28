const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const grid = document.querySelector('#numbersGrid');
const clearAllButton = document.querySelector('#clearAll');

numbers.forEach(number => {
  const numberBox = document.createElement('div');
  numberBox.classList.add('letter-box');

  const numberEl = document.createElement('div');
  numberEl.classList.add('letter');
  numberEl.textContent = number;
  numberBox.appendChild(numberEl);

  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 150;
  numberBox.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let isDrawing = false;

  const startPosition = e => {
    isDrawing = true;
    ctx.beginPath();
  };

  const endPosition = e => {
    isDrawing = false;
    ctx.closePath();
  };

  const draw = e => {
    if (isDrawing) {
      let x, y;
      const rect = canvas.getBoundingClientRect();
      if (e.type.includes('touch')) {
        x = e.touches[0].clientX - canvas.offsetLeft;
        y = e.touches[0].clientY - canvas.offsetTop;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mouseleave', endPosition);
  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('touchstart', startPosition);
  canvas.addEventListener('touchend', endPosition);
  canvas.addEventListener('touchmove', draw);

  grid.appendChild(numberBox);
});

clearAllButton.addEventListener('click', e => {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});
