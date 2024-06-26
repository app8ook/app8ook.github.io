// ПОИСК

// Получаем элементы формы и спойлеров
const searchInput = document.querySelector('.search');
const spoilers = document.querySelectorAll('details');
let csvData; // Сохраняем данные из CSV-файла

// Функция для поиска и фильтрации
function filterContent() {
  const searchTerm = searchInput.value.toLowerCase();
  const details = document.querySelectorAll('details');

  details.forEach(function(detail) {
    const page = detail.getAttribute('data-page');
    const table = detail.querySelector('tbody');
    const links = table.querySelectorAll('a');
    table.innerHTML = ''; // Очищаем содержимое таблицы

    let hasMatch = false;
    const filteredData = csvData.filter(row => row[0].toLowerCase() === page.toLowerCase() && row.some(cell => cell.toLowerCase().includes(searchTerm)));

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

      table.appendChild(row);
      hasMatch = true;
    }

    detail.open = hasMatch;
    detail.style.display = hasMatch ? 'block' : 'none';
  });
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

// Добавляем обработчик события на ввод в поле поиска
searchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  if (searchTerm.trim() === '') {
    restoreSpoilers(csvData);
    const details = document.querySelectorAll('details');
    details.forEach(detail => {
      detail.open = false;
      detail.style.display = 'block';
    });
  } else {
    filterContent();
  }
});

// Добавляем обработчик события на загрузку страницы
window.addEventListener('load', function() {
  const pageType = window.location.pathname.split('/').pop().replace('.html', '');
  readCSV(`data/data_${pageType}.csv`, data => {
    csvData = data;
    restoreSpoilers(data);
  });
});

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