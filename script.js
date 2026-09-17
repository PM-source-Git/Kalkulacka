const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

const OPERATORS = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
};

function formatNumber(value) {
  if (Number.isNaN(value)) return 'Chyba';
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return rounded.toString().replace('.', ',');
}

function render() {
  currentEl.textContent = current;
  historyEl.textContent =
    previous !== null && operator ? `${formatNumber(previous)} ${operator}` : '';
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    justEvaluated = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
}

function inputDecimal() {
  if (justEvaluated) {
    current = '0,';
    justEvaluated = false;
    return;
  }
  if (!current.includes(',')) current += ',';
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function backspace() {
  if (justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
}

function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
}

function applyPercent() {
  const value = parseFloat(current.replace(',', '.')) / 100;
  current = formatNumber(value);
}

function setOperator(nextOperator) {
  const value = parseFloat(current.replace(',', '.'));
  if (previous !== null && operator && !justEvaluated) {
    previous = OPERATORS[operator](previous, value);
    current = formatNumber(previous);
  } else {
    previous = value;
  }
  operator = nextOperator;
  justEvaluated = false;
  current = '0';
}

function evaluate() {
  if (operator === null || previous === null) return;
  const value = parseFloat(current.replace(',', '.'));
  const result = OPERATORS[operator](previous, value);
  historyEl.textContent = `${formatNumber(previous)} ${operator} ${formatNumber(value)} =`;
  current = formatNumber(result);
  previous = null;
  operator = null;
  justEvaluated = true;
}

document.querySelector('.buttons').addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (!btn) return;
  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    case 'sign':
      toggleSign();
      break;
    case 'percent':
      applyPercent();
      break;
    case 'operator':
      setOperator(value);
      break;
    case 'equals':
      evaluate();
      break;
  }
  render();
});

const KEY_MAP = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

window.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === '.' || key === ',') {
    inputDecimal();
  } else if (key in KEY_MAP) {
    setOperator(KEY_MAP[key]);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluate();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Escape') {
    clearAll();
  } else if (key === '%') {
    applyPercent();
  } else {
    return;
  }
  render();
});

render();
