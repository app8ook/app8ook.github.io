const DATA_URL = 'https://raw.githubusercontent.com/app8ook/app8ook.github.io/refs/heads/master/data/data.json';
let isIndexPage = false;

// Глобальные переменные фильтрации
let activePageTags = [];
let currentPageData = {};
let originalPageData = {};

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

async function fetchJsonData() {
  try {
    const response = await fetch(DATA_URL);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки JSON:', error);
    return null;
  }
}

function normalizeRus(str) {
  return str.toLowerCase().replace(/[ьъ]/g, '').replace(/[ёе]/g, 'е');
}

function containsAllWords(text, words) {
  const normText = normalizeRus(text);
  return words.every(word => normText.includes(normalizeRus(word)));
}

const categories = [
  { key: "Windows", path: "data.Windows", id: "resource-table-Windows" },
  { key: "Android", path: "data.Android", id: "resource-table-Android" },
  { key: "Games", path: "data.Games", id: "resource-table-Games", alname: "Игры" },
  { key: "Links", path: "data.Links", id: "resource-table-Links", alname: "Ссылки" }
];

// Функция для переключения темы
function toggleTheme() {
  const isLight = localStorage.getItem('theme') === 'light';
  document.documentElement.classList.toggle('light-theme', !isLight)
  localStorage.setItem('theme', !isLight ? 'light' : 'dark')
}

// Устанавливаем начальную тему при загрузке страницы
function setInitialTheme() {
  const themeToggle = document.querySelector('.toggle input[type="checkbox"]')
  const toggle = document.querySelector('.toggle')

  const isLight = localStorage.getItem('theme') === 'light';

  toggle.classList.add('no-transition')
  document.documentElement.classList.add('no-transition')

  document.documentElement.classList.toggle('light-theme', isLight);
  themeToggle.checked = isLight

  setTimeout(() => {
    toggle.classList.remove('no-transition')
    document.documentElement.classList.remove('no-transition')
  }, 10);
}

// FIX меню на мобилках

// Функция для проверки, открыт ли сайт на мобильном устройстве
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Проверяем устройство [Телефон/ПК]
function checkDevice() {
  // Получаем элементы меню
  const navMenu = document.querySelector('nav')
  const navToggle = navMenu?.querySelector('a')
  const navItems = navMenu?.querySelectorAll('li .second')

  if (!navMenu || !navToggle) return;

  // Проверяем, открыт ли сайт на мобильном устройстве
  if (isMobileDevice()) {
    navToggle.addEventListener('click', (event) => {
      event.preventDefault(); // Отменяем стандартное поведение ссылки
      navMenu.classList.toggle('open'); // Добавляем/удаляем класс 'open' для меню
      const isMenuOpen = navMenu.classList.contains('open') // Проверка navMenu на наличие класса 'open'
      if (!isMenuOpen) window.location.href = navToggle.href // Если меню закрыто, переходим на главную страницу
    });

    navItems?.forEach((item) => {
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
      if (!navMenu.contains(event.target)) navMenu.classList.remove('open'); // Закрываем меню, если клик произошел вне меню
    });
  } else {
    // Оставляем стандартную функциональность меню для ПК
    navMenu.addEventListener('mouseover', () => navMenu.classList.add('open'))
    navMenu.addEventListener('mouseout', () => navMenu.classList.remove('open'))

    navItems?.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation(); // Останавливаем всплытие события
        const link = item.querySelector('a');
        if (link) window.location.href = link.href; // Переходим по ссылке
      });
    });
  }
}

// Добавление Header
function AddDisclaimer() {
  document.querySelector('footer').innerHTML = `
  <div class="textbox">Разработчики сайта не несут ответственность за нарушение авторских прав пользователями сайта, а так же за программы изменяющие систему или сами сборки ОС, вы устанавливаете и пользуетесь ими на свой страх и риск</div><br>
  <div class="footer-links">
    <a href="https://t.me/blobx" class="halfbutt" target="_blank">Вопросы и предложения</a>
    <a href="https://t.me/s/app8ook" class="halfbutt" target="_blank">App8ook | 2018-2025</a><br>
  </div>
  `
}

// Добавление Footer
function AddHeader() {
  const header = document.createElement('div')

  header.classList.add('bgl')
  header.innerHTML = `
        <div class="container">
          <nav id="nav" class="nav">
            <ul>
              <li><a href="/" class="first"><img src="pics/home.png" class="pic" width="25" height="25"> <p>Меню</p></a>
                <ul class="second">
                  <li><a href="Windows.html"><img src="pics/windows.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Windows</a></li>

                  <li><a href="Android.html"><img src="pics/android.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Android</a></li>

                  <li><a href="Apple.html"><img src="pics/apple.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Apple</a></li>

                  <li><a href="Linux.html"><img src="pics/linux.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Linux</a></li>

                  <li><a href="Games.html"><img src="pics/games.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Игры</a></li>

                  <li><a href="Links.html"><img src="pics/links.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Cсылки</a></li>

                  <li><a href="Info.html"><img src="pics/info.png" class="pic" width="25" height="25"
                        style="vertical-align: middle"> Инфо</a></li>
                </ul>
              </li>
            </ul>
          </nav>

          <form>
            <div class="search-container">
              <input type="text" name="text" class="search" label="Найти" placeholder="Поиск по сайту">
              <span class="clear-btn">&times;</span>
            </div>
          </form>

          <div class="checkbox-container">

            <label class="toggle">
              <input type="checkbox">
              <span class="slider"></span>
              <span class="labels" data-on="Light" data-off="Dark"></span>
            </label>

          </div>
        </div>
        <br>
      `

  document.querySelector('div.text').append(header)

  const themeToggle = document.querySelector('.toggle input[type="checkbox"]')
  setInitialTheme() // Устанавливаем начальную тему
  themeToggle.addEventListener('change', toggleTheme) // Добавляем обработчик события на переключатель
}

// Предзагрузочное выполнение функций
document.addEventListener('DOMContentLoaded', () => {
  const CurrentPageName = window.location.pathname.replace(/^\/(.*)(.html)$/, '$1') // Текущая страница (без "/" & ".html")

  AddHeader() // Добавление Header
  AddDisclaimer() // Добавление Footer
  checkDevice() // Проверяем устройство [Телефон/ПК]

  if (CurrentPageName == 'Search') showResults();

  loadJsonData(CurrentPageName)
  // loadMD(CurrentPageName)

  const searchInput = document.querySelector('.search');
  const searchForm = document.querySelector('form');

  if (searchInput && searchForm) {
    const performSearch = () => {
      const value = searchInput.value.trim();
      if (value.length >= 2) window.location.href = '/Search.html?query=' + encodeURIComponent(value)
    };

    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      performSearch()
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch()
      }
    });
  }

  // Крестик
  const clearBtn = document.querySelector('.clear-btn');
  if (searchInput && clearBtn) {
    searchInput.addEventListener('input', () => {
      clearBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
    });
  }
});

async function showResults() {
  const query = getQueryParam('query');
  const container = document.getElementById('search-results');

  if (!query || query.length < 2) return container.innerHTML = '<div class="textbox">Введите запрос (минимум 2 символа)</div>';

  container.innerHTML = '<div class="textbox">Ищем...</div>';

  const jsonData = await fetchJsonData();
  if (!jsonData || !jsonData.data) return container.innerHTML = '<div class="textbox">Ошибка загрузки данных</div>';

  container.innerHTML = '';
  let foundAny = false;
  const searchWords = query.toLowerCase().trim().split(/\s+/);


  let List = {}

  for (const cat of categories) {
    const topLevel = jsonData.data[cat.key];
    if (!topLevel || typeof topLevel !== 'object') continue;

    List[cat.key] = []

    for (const subcatName in topLevel) {
      const subcatData = topLevel[subcatName];
      if (!Array.isArray(subcatData)) continue;

      const matches = subcatData.filter(row =>
        row.slice(0, 3).some(cell => containsAllWords(cell || '', searchWords))
      );

      if (matches.length != 0) matches.forEach((el) => List[cat.key].push(el))
    }

    if (List[cat.key].length > 0) {
      foundAny = true;

      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');

      let category_name
      for (let category of categories) {
        if (cat.key == category.key) category_name = category.alname == undefined ? cat.key : category.alname
      }

      summary.innerHTML = `<div class="spoiler" align="center">${category_name}</div>`;
      details.append(summary, document.createElement('br'))

      const table = document.createElement('table');
      table.innerHTML = `<col width="33%"><col width="33%"><col width="33%"><tbody></tbody>`;
      const tbody = table.querySelector('tbody');

      for (let i = 0; i < List[cat.key].length; i += 3) {
        const chunk = List[cat.key].slice(i, i + 3)
        tbody.appendChild(createLinksBlock(chunk));
      }
      details.appendChild(table);
      container.appendChild(details);
    }
  }

  if (!foundAny) {
    container.innerHTML = `<div class="textbox">Ничего не найдено по запросу "${query}"</div>`;
  }
}

function getCategoryData(jsonData, path) {
  const categoryPath = path.split('.');
  let categoryData = jsonData;
  for (const key of categoryPath.slice(1)) {
    categoryData = categoryData?.[key];
    if (!categoryData || !Array.isArray(categoryData)) return [];
  }
  return categoryData || [];
}

// Получение тегов страницы
async function loadJsonData(pageName) {
  try {
    const response = await fetch(DATA_URL);
    const jsonData = await response.json();
    window.jsonData = jsonData; // ✅ Глобальная переменная для тегов

    const container = document.getElementById('categories-container') == undefined ? document.getElementById('search-results') : document.getElementById('categories-container')

    if (pageName === '/') {
      isIndexPage = true;
      const myData = jsonData.mydata;

      Object.keys(myData).forEach(sectionName => {
        const sectionData = myData[sectionName];
        Object.keys(sectionData).forEach(categoryName => {
          const categoryData = sectionData[categoryName];

          const details = document.createElement('details'); // Создаем спойлер
          details.setAttribute('data-page', categoryName.toLowerCase());

          const summary = document.createElement('summary');
          summary.innerHTML = `<div class="spoiler" align="center">${categoryName}</div>`;
          details.appendChild(summary);
          details.appendChild(document.createElement('br'));

          const table = document.createElement('table');
          table.setAttribute('align', 'center');
          table.innerHTML = `<col width="33%"><col width="33%"><col width="33%"><tbody id="resource-table-${categoryName.toLowerCase()}"></tbody>`;

          const tbody = table.querySelector('tbody');
          for (let i = 0; i < categoryData.length; i += 3) {
            const chunk = categoryData.slice(i, i + 3);
            const row = createLinksBlock(chunk);
            tbody.appendChild(row);
          }

          details.appendChild(table);
          container.appendChild(details);
        });
      });
      isIndexPage = false;
    } else {
      // страницы Windows, Android...
      const pageData = jsonData?.data[pageName];
      if (!pageData) {
        createPageTagsFilter(pageName);
        loadMD(pageName)
        return
      }

      currentPageData = pageData;
      originalPageData = JSON.parse(JSON.stringify(pageData));

      Object.keys(pageData).forEach(categoryName => {
        const categoryData = pageData[categoryName];

        const details = document.createElement('details');
        details.setAttribute('data-page', categoryName.toLowerCase());

        const summary = document.createElement('summary');
        summary.innerHTML = `<div class="spoiler" align="center">${categoryName}</div>`;
        details.appendChild(summary);
        details.appendChild(document.createElement('br'));

        const table = document.createElement('table');
        table.setAttribute('align', 'center');
        table.innerHTML = `<col width="33%"><col width="33%"><col width="33%"><tbody id="resource-table-${categoryName.toLowerCase()}"></tbody>`;

        const tbody = table.querySelector('tbody');
        for (let i = 0; i < categoryData.length; i += 3) {
          const chunk = categoryData.slice(i, i + 3);
          const row = createLinksBlock(chunk);
          tbody.appendChild(row);
        }

        details.appendChild(table);
        container.appendChild(details);
      });

      createPageTagsFilter(pageName);
    }

    loadMD(pageName)

  } catch (error) {
    console.error('Ошибка загрузки JSON:', error);
  }
}


async function loadMD(PageName) {
  const ContentContainer = document.getElementById('info-container')

  try {
    const DataResponse = await fetch(DATA_URL);
    const jsonData = await DataResponse.json();

    let CurrentURL = jsonData.MDs[`${PageName.toLowerCase()}`]

    if (!CurrentURL) return

    const response = await fetch(CurrentURL);
    const markdown = await response.text();

    const sections = markdown.split(/_{10,}/).filter(s => s.trim().length > 10)

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      const RegExp = /^@(.*)@$/gm;

      const title = lines.find(line => RegExp.exec(line.trim()))

      function LinesSlices(lines) {
        return lines.slice(RegExp.test(title) ? 1 : 0).join('\n')
          .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" class="smablock">$1</a>')
          .replace(/```([^\`]+)```/gs, '<div onclick="copy(this)" class="cline">$1</div><br>')
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>')
          .replace(/(.*)\n$/gm, '$1<br>')
          .replace(/^(\s{12,})(.*)$/gm, '<div style="text-indent:150px;">$2</div>')
          .replace(/^(\s{8,})(.*)$/gm, '<div style="text-indent:100px;">$2</div>')
          .replace(/^(\s{4,})(.*)$/gm, '<div style="text-indent:50px;">$2</div>')
          .replace(/^(.*)$/gm, '<div>$1</div>')
      }

      if (title) {
        const details = document.createElement('details'); // Создаем спойлер
        details.open = false;

        const summary = document.createElement('summary');
        summary.innerHTML = `<div class="spoiler" align="center">${title?.replace(RegExp, '$1')}</div>`;

        details.appendChild(summary);
        details.appendChild(document.createElement('br'));

        const contentDiv = document.createElement('div'); // Контент
        contentDiv.className = 'textbox';
        contentDiv.style.cssText = 'margin:10px;line-height:1.4;text-align:left;';

        contentDiv.innerHTML = LinesSlices(lines)

        details.appendChild(contentDiv)
        ContentContainer.appendChild(details)
      } else ContentContainer.innerHTML += LinesSlices(lines)
    })
  } catch (error) {
    console.error(`MD [${PageName}]:`, error);
    ContentContainer.innerHTML = `MD [${PageName}] временно недоступен`;
  }
}


function createLinksBlock(chunk) {
  const row = document.createElement('tr');
  for (let j = 0; j < 3; j++) {
    const cell = document.createElement('td');
    const linkDiv = document.createElement('div');
    linkDiv.className = 'tblcol';

    if (chunk[j] && chunk[j].length >= 3) {
      const [title, desc, url] = chunk[j];

      if (isIndexPage) {
        linkDiv.innerHTML = `<a href="${url || '#'}" target="_blank" class="butt">${title}<br><br>${desc || ''}</a>`; // БЕЗ тегов/дат для index
      } else if (chunk[j].length >= 5) {
        const [_, __, ___, tags, date] = chunk[j]; // С тегами/датами для обычных страниц
        linkDiv.innerHTML = `
              <div class="element-tags-hover">${tags ? tags.split(', ').map(tag => `<span class="tag-chip">${tag.trim()}</span>`).join('') : 'нет тегов'}</div>
              <a href="${url || '#'}" target="_blank" class="butt">${title}<br><br>${desc || ''}</a>
                <div class="element-date-hover">${date || 'без даты'}</div>
                `;
        linkDiv.dataset.tags = tags || '';
      }
    }
    cell.appendChild(linkDiv);
    row.appendChild(cell);
  }
  return row;
}


// Плашка тегов страницы
function createPageTagsFilter() {
  const filterContainer = document.getElementById('page-tags-filter');


  function GetCountTags() {
    let tag_counts = {}

    document.querySelectorAll('div [class="tblcol"]').forEach(el => {
      if (el.innerHTML != '' && el.getAttribute('data-tags') != '')
        el.getAttribute('data-tags').split(', ').forEach(tag => {
          tag_counts[tag] = (tag_counts[tag] || 0) + 1
        })
    })

    return tag_counts
  }

  function GetTags() {
    const tags = Object.entries(GetCountTags())
      .sort((a, b) => b[1] - a[1])
      .map(entry => `${entry[0]} (${entry[1]})`);

    return tags.join(', ')
  }

  const tagsData = GetTags()

  if (!tagsData) return filterContainer.style.display = 'none'

  const container = document.getElementById('page-tags-container');

  let tags = []

  container.querySelectorAll('span').forEach(tag => {
    const tagContent = tag.textContent.split(/ \(\d+\),?/g)[0]
    if (activePageTags.indexOf(tagContent) != -1) {
      tag.textContent = `${tagContent} (${GetCountTags()[tagContent]})`
      tags.push(tag)
    }
  })

  container.innerHTML = ''

  tags.forEach(tag => container.appendChild(tag))

  tagsData.split(', ').forEach(tag => {
    if (!container.innerHTML.includes(tag.trim())) {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'page-tag-filter';
      tagSpan.textContent = tag.trim()
      tagSpan.onclick = () => togglePageTagFilter(tag.trim());
      container.appendChild(tagSpan);
    }
  });

  filterContainer.style.display = 'flex';
}

// Фильтрация по тегам страницы
async function togglePageTagFilter(tag) {
  const tagName = tag.split(/ \(\d+\),?/g)[0]

  const tagElement = Array.from(document.querySelectorAll('.page-tag-filter')).find(el =>
    el.textContent.trim() === tag
  );

  const index = activePageTags.indexOf(tagName);

  if (index != -1) {
    activePageTags.splice(index, 1);
    if (tagElement) tagElement.classList.remove('active');
  } else {
    activePageTags.push(tagName);
    if (tagElement) tagElement.classList.add('active');
  }

  applyPageFilter()
  setTimeout(() => {
    createPageTagsFilter()
  }, 100);
}

async function applyPageFilter() {
  const container = document.getElementById('categories-container') == undefined ? document.getElementById('search-results') : document.getElementById('categories-container')
  const status = document.getElementById('filter-status');


  if (window.location.href.includes('Search') && getQueryParam('query') != '') await showResults()

  function SearchPageData() {
    let ItemsList = {}

    document.querySelectorAll('details').forEach(category => {
      const cat_name = category.querySelector('.spoiler').innerHTML
      ItemsList[cat_name] = []

      category.querySelectorAll('.butt').forEach(el => {
        ItemsList[cat_name].push([el.innerHTML.split('<br><br>')[0], el.innerHTML.split('<br><br>')[1], el.href, el.parentElement.getAttribute('data-tags') == '' ? '' : el.parentElement.getAttribute('data-tags'), el.parentElement.querySelector('.element-date-hover').innerHTML])
      })
    })

    return ItemsList
  }

  const PageData = !originalPageData || Object.keys(originalPageData).length === 0 ? SearchPageData() : originalPageData

  let totalVisible = 0;

  container.innerHTML = '';

  Object.keys(PageData).forEach(categoryName => {
    const categoryData = PageData[categoryName];

    // ФИЛЬТРУЕМ элементы по тегам
    const filteredData = categoryData.filter(item => {
      const tags = (item[3] || '').split(', ').map(t => t.trim());
      return activePageTags.every(tag => tags.includes(tag));
    });

    // ПОКАЗЫВАЕМ спойлер если есть данные ИЛИ фильтр снят
    if (filteredData.length > 0 || activePageTags.length === 0) {
      totalVisible += filteredData.length;

      const details = document.createElement('details');
      details.setAttribute('data-page', categoryName.toLowerCase());

      // ОТКРЫВАЕМ если фильтр активен И есть данные
      if (window.location.href.includes('Search')) details.open = true
      else details.open = activePageTags.length > 0 && filteredData.length > 0;

      const summary = document.createElement('summary');
      summary.innerHTML = `<div class="spoiler" align="center">${categoryName}</div>`;
      details.appendChild(summary);
      details.appendChild(document.createElement('br'));

      const table = document.createElement('table');
      table.align = 'center';
      table.innerHTML = `<col width="33%"><col width="33%"><col width="33%"><tbody></tbody>`;
      const tbody = table.querySelector('tbody');

      // Строим таблицу из отфильтрованных данных
      for (let i = 0; i < filteredData.length; i += 3) {
        const chunk = filteredData.slice(i, i + 3);
        tbody.appendChild(createLinksBlock(chunk));
      }

      details.appendChild(table);
      container.appendChild(details);
    }
  });

  // Статус
  if (status) {
    const statusText = activePageTags.length === 0 ? '' :
      totalVisible === 0 ? 'Ничего не найдено' : `Найдено: ${totalVisible}`;
    status.textContent = statusText;
    status.style.display = statusText ? 'block' : 'none';
  }
}




// Внешние функции HTML-JS
function copy(el) {
  navigator.clipboard.writeText(el.textContent);
  alert("Текст скопирован!")
}


