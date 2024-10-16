// ПОИСК

// Получаем элементы формы и спойлеров
const searchInput = document.querySelector('.search');
const details = document.querySelectorAll('details');
const linkContainers = document.querySelectorAll('.tblcol');

// Функция для поиска и фильтрации
function filterContent() {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm.trim().length >= 3) {
    let hasMatchInDetails = false;
    let hasMatchInLinks = false;

    details.forEach(detail => {
      const summary = detail.querySelector('summary');
      const content = detail.querySelector('.textbox');
      const links = Array.from(detail.querySelectorAll('a.butt'));

      if (summary.textContent.toLowerCase().includes(searchTerm) || (content && content.textContent.toLowerCase().includes(searchTerm)) || links.some(link => link.textContent.toLowerCase().includes(searchTerm))) {
        detail.open = true;
        detail.classList.add('match');
        hasMatchInDetails = true;
      } else {
        detail.style.display = 'none';
      }
    });

    linkContainers.forEach(container => {
      const links = Array.from(container.querySelectorAll('a.butt'));
      let hasMatch = true;

      links.forEach(link => {
        if (link.textContent.toLowerCase().includes(searchTerm)) {
          link.parentElement.style.display = 'block';
          hasMatch = true;
          hasMatchInLinks = true;
        } else {
          link.parentElement.style.display = 'none';
        }
      });

      if (!hasMatch) {
        container.style.display = 'none';
      } else {
        container.style.display = 'block';
      }
    });

    if (hasMatchInDetails || hasMatchInLinks) {
      searchInput.classList.add('active');
    } else {
      searchInput.classList.remove('active');
    }
  } else {
    details.forEach(detail => {
      detail.style.display = 'block';
      detail.open = false;
      detail.classList.remove('match');
    });

    linkContainers.forEach(container => {
      container.style.display = 'block';
      const links = container.querySelectorAll('a.butt');
      links.forEach(link => {
        link.parentElement.style.display = 'block';
      });
    });
    searchInput.classList.remove('active');
  }
}

// Обработчик события на ввод в поле поиска
searchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  if (searchTerm.trim() === '') {
    details.forEach(detail => {
      detail.open = false;
    });
    filterContent();
  } else {
    filterContent();
  }
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