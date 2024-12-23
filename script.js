const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const undoBtn = document.querySelector('#undo-btn');
const redoBtn = document.querySelector('#redo-btn');
const clearBtn = document.querySelector('#clear-btn');
const container = document.querySelector('.container');
const changeFont = document.querySelector('#change-font');

let isDrawing = false;
let data = [];
let d = [];
let removedData = [];

const get = (k, d) => JSON.parse(localStorage.getItem(`learn-number-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`learn-number-${k}`, JSON.stringify(v));

const startPosition = (c, e) => {
    isDrawing = true;
    const ctx = c.getContext('2d');
    ctx.beginPath();
    e.preventDefault();
};

const endPosition = (canvas, e) => {
    isDrawing = false;
    const c = canvas.classList.value;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    if (d.length > 0) {
        data.push({c, d});
    }
    d = [];
    undoBtn.classList.add('enable');
    undoBtn.classList.remove('disable');
    clearBtn.classList.add('enable');
    clearBtn.classList.remove('disable');
    set('data', {data, removedData});
    e.preventDefault();
};

const draw = (c, e) => {
    if (isDrawing) {
        const rect = c.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        const ctx = c.getContext('2d');
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(x, y);
        ctx.stroke();
        (x || y) && d.push({ x, y });
    }
    e.preventDefault();
};

const undo = e => {
    if (data.length == 0) {
        console.warn('No undo available');
        return false;
    }
    removedData.push(data.pop());
    document.querySelectorAll('canvas').forEach(c => drawAll(c, e));
    set('data', {data, removedData});
};

const redo = e => {
    if (removedData.length == 0) {
        console.warn('No redo available');
        return false;
    }
    data.push(removedData.pop());
    document.querySelectorAll('canvas').forEach(c => drawAll(c, e));
    set('data', {data, removedData});
};

const clear = (c, cd = true) => {
    undoBtn.classList.add('disable');
    undoBtn.classList.remove('enable');
    redoBtn.classList.add('disable');
    redoBtn.classList.remove('enable');
    clearBtn.classList.add('disable');
    clearBtn.classList.remove('enable');
    if (cd) {
        data = [];
        removedData = [];
        set('data', {data, removedData});
    }
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
};

const drawAll = (canvas, e) => {
    clear(canvas, false);
    if (data.length !== 0) {
        undoBtn.classList.add('enable');
        undoBtn.classList.remove('disable');
    }
    if (removedData.length !== 0) {
        redoBtn.classList.add('enable');
        redoBtn.classList.remove('disable');
    }
    if (data.length !== 0 || removedData.length !== 0) {
        clearBtn.classList.add('enable');
        clearBtn.classList.remove('disable');
    }
    const ctx = canvas.getContext('2d');
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    data.forEach(({c, d}) => {
        if (canvas.classList.value == c) {
            let i = 0;
            d.forEach(o => {
                const { x, y } = o;
                if (i == 0) {
                    ctx.beginPath();
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (d.length == i) {
                    ctx.moveTo(x, y);
                    ctx.stroke();
                    ctx.beginPath();
                } else {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                i++;
            });
            ctx.beginPath();
        }
    });
};

const changeFontFamily = font => {
    const fontFamily = font ? "'Patrick Hand', cursive" : "Arial, sans-serif"; 
    document.querySelectorAll('.number').forEach(number => number.style.fontFamily = fontFamily);
};

changeFont.addEventListener('change', e => {
    const font = e.target.checked;
    changeFontFamily(font);
    set('font', {font});
    document.querySelectorAll('canvas').forEach(c => clear(c));
});

undoBtn.addEventListener('click', e => undo(e));
redoBtn.addEventListener('click', e => redo(e));
clearBtn.addEventListener('click', e => document.querySelectorAll('canvas').forEach(c => clear(c)));

document.addEventListener('keydown', e => {
  switch (e.which) {
    case 38:
    case 67:
        document.querySelectorAll('canvas').forEach(c => clear(c));
      break;
    case 37:
        undo(e);
      break;
    case 39:
        redo(e);
      break;
  }
});

(e => {
    numbers.forEach(number => {
        const box = document.createElement('div');
        box.classList.add('box');

        const el = document.createElement('div');
        el.classList.add('number');
        el.textContent = number;
        box.appendChild(el);

        const canvas = document.createElement('canvas');
        canvas.classList.add(number);
        canvas.width = 120;
        canvas.height = 120;
        box.appendChild(canvas);

        canvas.addEventListener('pointerdown', e => startPosition(canvas, e));
        canvas.addEventListener('pointerup', e => endPosition(canvas, e));
        canvas.addEventListener('pointerout', e => endPosition(canvas, e));
        canvas.addEventListener('pointermove', e => draw(canvas, e));

        canvas.addEventListener('mousedown', e => startPosition(canvas, e));
        canvas.addEventListener('mouseup', e => endPosition(canvas, e));
        canvas.addEventListener('mouseleave', e => endPosition(canvas, e));
        canvas.addEventListener('mousemove', e => draw(canvas, e));

        canvas.addEventListener('touchstart', e => startPosition(canvas, e));
        canvas.addEventListener('touchend', e => endPosition(canvas, e));
        canvas.addEventListener('touchmove', e => draw(canvas, e));

        container.appendChild(box);

        const { font } = get('font', false);
        changeFontFamily(font);
        changeFont.checked = font;
    });
    const {data: d, removedData: rd} = get('data', {data: [], removedData: []});
    data = d;
    removedData = rd;
    (d.length !== 0) && document.querySelectorAll('canvas').forEach(c => drawAll(c, e));
})();