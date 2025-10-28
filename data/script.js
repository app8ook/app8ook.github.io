// ПОИСК

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search');
  const searchForm = document.getElementById('search-form');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const value = searchInput.value.trim();
      if (value.length >= 2
      ) {
        window.location.href = '/search.html?query=' + encodeURIComponent(value);
      }
    });
    // Дополнительно: при нажатии Enter на инпуте
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchInput.value.trim().length >= 2) {
          window.location.href = '/search.html?query=' + encodeURIComponent(searchInput.value.trim());
        }
      }
    });
  }
  // Крестик
  const clearBtn = document.querySelector('.clear-btn');

  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    clearBtn.style.display = 'none';
  });

});

const categories = [
  { key: "Games", file: "data/data_Games.csv", id: "resource-table-Games" },
  { key: "Windows", file: "data/data_Windows.csv", id: "resource-table-Windows" },
  { key: "Android", file: "data/data_Android.csv", id: "resource-table-Android" },
  { key: "Links", file: "data/data_Links.csv", id: "resource-table-Links" }
];

// Получение query-параметра
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

// Загрузка CSV (разделитель — ; )
function fetchCSV(file) {
  return fetch(file)
    .then(r => r.ok ? r.text() : '')
    .then(data => {
      if (!data) return [];
      return data
        .trim()
        .split('\n')
        .slice(1) // скипаем заголовок (шапку)
        .map(row => row.split(';'))
        .filter(row => row[0] && row[0].trim() !== ''); // пропускаем строки с пустым первым столбцом
    });
}

// Формирование строки таблицы из 3 элементов
function createLinksBlock(chunk) {
  const row = document.createElement('tr');
  for (let j = 0; j < 3; j++) {
    const cell = document.createElement('td');
    const link = document.createElement('div');
    link.className = 'tblcol';
    if (chunk[j] && chunk[j].length >= 4) {
      const anchor = document.createElement('a');
      anchor.href = chunk[j][1];
      anchor.target = '_blank';
      anchor.className = 'butt';
      anchor.innerHTML = `${chunk[j][2]}<br><br>${chunk[j][3]}`;
      link.appendChild(anchor);
    }
    cell.appendChild(link);
    row.appendChild(cell);
  }
  return row;
}

// Функция для замены взаимозаменяемых символов русского языка,
// возвращает «нормализованную» строку для сравнения
function normalizeRus(str) {
  return str
    .toLowerCase()
    .replace(/[ьъ]/g, '') // убираем мягкий и твёрдый знаки
    .replace(/[ёе]/g, 'е'); // ё заменяем на е
}

// Функция проверки, что все слова из массива есть в тексте
function containsAllWords(text, words) {
  const normText = normalizeRus(text);
  return words.every(word => normText.includes(normalizeRus(word)));
}

// Функция проверки, что все слова из массива есть в тексте
async function showResults() {
  const query = getQueryParam('query').toLowerCase();
  if (!query || query.length < 2) return;

  const container = document.getElementById('search-results');
  container.innerHTML = '';

  let foundAny = false;
  // Разбиваем запрос на слова через пробел
  const searchWords = query.trim().split(/\s+/);

  for (const cat of categories) {
    const data = await fetchCSV(cat.file);

    // Фильтрация — строка должна содержать все слова в любом порядке в одной ячейке (кроме 1-го столбца)
    const matches = data.filter(row => 
      row.slice(1).some(cell => containsAllWords(cell, searchWords))
    );

    if (matches.length) {
      foundAny = true;

      if (container.children.length > 0) {
        container.appendChild(document.createElement('br'));
      }

      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      summary.innerHTML = `<div class="spoiler" align="center">${cat.key}</div>`;
      details.appendChild(summary);
      details.appendChild(document.createElement('br'));

      const table = document.createElement('table');
      table.setAttribute('align', 'center');
      table.innerHTML = `<col width="33%"><col width="33%"><col width="33%"><tbody id="${cat.id}"></tbody>`;
      const tbody = table.querySelector('tbody');

      for (let i = 0; i < matches.length; i += 3) {
        const chunk = matches.slice(i, i + 3);
        tbody.appendChild(createLinksBlock(chunk));
      }

      details.appendChild(table);
      container.appendChild(details);
    }
  }

  if (!foundAny) {
    container.innerHTML = '<div class="textbox">Ничего не найдено</div>';
  }
}

document.addEventListener('DOMContentLoaded', showResults);


//ЧТЕНИЕ И ВЫВОД ИЗ CSV ПОД СПОЙЛЕРЫ

// Функция для чтения CSV-файла
function readCSV(file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      const rows = data.trim().split('\n');
      const result = rows.slice(1).map(row => row.split(';'));
      callback(result);
    })
    .catch(error => console.error(error));
}

// Функция для восстановления содержимого спойлеров
function restoreSpoilers(data) {
  const details = document.querySelectorAll('details');
  details.forEach(detail => {
    const page = detail.getAttribute('data-page');
    const table = detail.querySelector('tbody');
    table.innerHTML = '';
    const rows = createTableRows(data, page);
    rows.forEach(row => table.appendChild(row));
  });
}

// Функция для создания HTML-элементов из CSV-данных
function createTableRows(data, page) {
  const rows = [];
  const filteredData = data.filter(row => row[0].toLowerCase() === page.toLowerCase());

  for (let i = 0; i < filteredData.length; i += 3) {
    const row = document.createElement('tr');
    const chunk = filteredData.slice(i, i + 3);

    for (let j = 0; j < chunk.length; j++) {
      const cell = document.createElement('td');
      const link = document.createElement('div');
      link.className = 'tblcol';

      if (chunk[j] && chunk[j].length >= 4) {
        const anchor = document.createElement('a');
        anchor.href = chunk[j][1];
        anchor.target = '_blank';
        anchor.className = 'butt';
        anchor.innerHTML = `${chunk[j][2]}<br><br>${chunk[j][3]}`;
        link.appendChild(anchor);
      }
      cell.appendChild(link);
      row.appendChild(cell);
    }
    rows.push(row);
  }
  return rows;
}

// ТЕМЫ
// Получаем элемент переключателя
const themeToggle = document.querySelector('.toggle input[type="checkbox"]');

// Функция для переключения темы
function toggleTheme() {
  // Получаем текущее значение темы из localStorage
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Переключаем тему
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
  }
}

// Устанавливаем начальную тему при загрузке страницы
function setInitialTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    themeToggle.checked = true;
  }
}

// Добавляем обработчик события на переключатель
themeToggle.addEventListener('change', toggleTheme);

// Устанавливаем начальную тему
setInitialTheme();

// FIX меню на мобилках

// Функция для проверки, открыт ли сайт на мобильном устройстве
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Получаем элементы меню
const navMenu = document.querySelector('#nav');
const navToggle = navMenu.querySelector('a');
const navItems = navMenu.querySelectorAll('li .second');

// Проверяем, открыт ли сайт на мобильном устройстве
if (isMobileDevice()) {
  let isMenuOpen = false; // Флаг для отслеживания состояния меню

  navToggle.addEventListener('click', (event) => {
    event.preventDefault(); // Отменяем стандартное поведение ссылки
    navMenu.classList.toggle('open'); // Добавляем/удаляем класс 'open' для меню
    isMenuOpen = !isMenuOpen; // Обновляем состояние меню

    if (!isMenuOpen) {
      // Если меню закрыто, переходим на главную страницу
      window.location.href = navToggle.href;
    }
  });

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие события
      const link = item.querySelector('a');
      if (link) {
        navMenu.classList.remove('open'); // Закрываем меню
        window.location.href = link.href; // Переходим по ссылке
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.contains(event.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open'); // Закрываем меню, если клик произошел вне меню
      isMenuOpen = false; // Обновляем состояние меню
    }
  });
} else {
  // Оставляем стандартную функциональность меню для ПК
  navMenu.addEventListener('mouseover', () => {
    navMenu.classList.add('open');
  });

  navMenu.addEventListener('mouseout', () => {
    navMenu.classList.remove('open');
  });

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие события
      const link = item.querySelector('a');
      if (link) {
        window.location.href = link.href; // Переходим по ссылке
      }
    });
  });
}