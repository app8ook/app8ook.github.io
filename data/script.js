const DATA_URL = 'https://raw.githubusercontent.com/app8ook/app8ook.github.io/refs/heads/master/data/data.json';

const section_main = document.querySelector('#main')
const section_tags = document.querySelector('#tags')

let activeTags = []
let currentPageData = {}

async function fetchJsonData() {
    try {
        const response = await fetch(DATA_URL);
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки JSON:', error);
        return null;
    }
}


function containsAllWords(text, words) {
    const normText = normalizeRus(text);
    return words.every(word => normText.includes(normalizeRus(word)));
}

function normalizeRus(str) {
    return str.toLowerCase().replace(/[ьъ]/g, '').replace(/[ёе]/g, 'е');
}

async function showResults() {
    activeTags = []
    const query = localStorage.getItem('query')

    window.location.hash = `search`
    document.querySelector('title').innerHTML = 'SEARCH'

    document.querySelector('#search').value = query
    document.querySelector('.clear-btn').style.display = 'block'

    section_main.innerHTML = '<div class="searchbox">Ищем...</div>'

    const jsonData = await fetchJsonData()
    if (!jsonData || !jsonData.data) return section_main.innerHTML = '<div class="searchbox">Ошибка загрузки данных</div>'


    section_main.innerHTML = `<div class="searchbox">Результаты поиска "${query}":</div>`
    let foundAny = false
    const searchWords = query.toLowerCase().trim().split(/\s+/)

    let List = {}

    const categories = [
        { key: "Windows", path: "data.Windows", id: "resource-table-Windows" },
        { key: "Android", path: "data.Android", id: "resource-table-Android" },
        { key: "Games", path: "data.Games", id: "resource-table-Games", alname: "Игры" },
        { key: "Links", path: "data.Links", id: "resource-table-Links", alname: "Ссылки" }
    ];

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

            summary.textContent = `${category_name}`;
            details.append(summary, document.createElement('br'))

            const table = document.createElement('table');
            table.innerHTML = `<tbody></tbody>`;
            const tbody = table.querySelector('tbody');

            for (let i = 0; i < List[cat.key].length; i += 3) {
                const chunk = List[cat.key].slice(i, i + 3)
                tbody.appendChild(createLinksBlock(chunk));
            }
            details.appendChild(table);
            section_main.appendChild(details);
        }

        currentPageData = List
    }


    if (!foundAny)
        section_main.innerHTML = `<div class="searchbox">Ничего не найдено по запросу "${query}"</div>`

    createTags()
}


function toggleTheme() {
    const isLight = localStorage.getItem('theme') === 'light';
    document.documentElement.classList.toggle('light-theme', !isLight)
    localStorage.setItem('theme', !isLight ? 'light' : 'dark')
}

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
        toggle.style.display = 'inline-block'
        document.documentElement.classList.remove('no-transition')

        document.body.style.opacity = 1
    }, 100);
}


async function loadJsonData(pageName) {
    pageName = pageName.replace('#', '')
    if (pageName.toLocaleLowerCase() == 'pagenotfound') document.querySelector('title').innerHTML = 'ERROR 404'
    else document.querySelector('title').innerHTML = pageName.toLocaleUpperCase() == '/' ? 'APP8OOK' : pageName.toLocaleUpperCase()
    window.location.hash = pageName

    if (pageName.startsWith('search')) return showResults()

    localStorage.setItem('pastPage', pageName)

    document.querySelector('#search').value = '';
    document.querySelector('.clear-btn').style.display = 'none'

    activeTags = []

    const response = await fetch(DATA_URL);
    const jsonData = await response.json();

    section_main.innerHTML = ''

    // Загрузка data файлов
    const pageData = jsonData?.data[pageName] ?
        jsonData?.data[pageName] : jsonData?.mydata[pageName == '/' ? 'index' : pageName]

    if (pageData) {
        currentPageData = pageData

        Object.keys(pageData).forEach(categoryName => {
            const categoryData = pageData[categoryName];

            createPageData(categoryData, categoryName)
        });
    }

    // Загрузка MDs файлов
    const pageMDs = jsonData?.MDs[pageName.toLocaleLowerCase()]

    if (pageMDs) {
        try {
            const response = await fetch(pageMDs);
            const markdown = await response.text();

            const sections = markdown.split(/_{10,}/).filter(s => s.trim().length > 10)

            sections.forEach((sec, index) => {
                const lines = sec.trim().split('\n');
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
                    const details = document.createElement('details')
                    details.open = activeTags[0]

                    const summary = document.createElement('summary')
                    summary.textContent = `${title?.replace(RegExp, '$1')}`

                    details.appendChild(summary)

                    const contentDiv = document.createElement('div')
                    contentDiv.className = 'textbox'

                    contentDiv.innerHTML = LinesSlices(lines)

                    details.appendChild(contentDiv)
                    setTimeout(() => {
                        section_main.appendChild(details)
                    }, 10);
                } else section_main.innerHTML += LinesSlices(lines)

            })
        } catch (error) {
            console.error(`MD [${pageName}]:`, error);
        }
    }


    document.querySelectorAll('details').forEach(detail => {
        detail.open = activeTags[0]
    })


    // 404 Not Found
    setTimeout(() => {
        if (section_main.innerHTML == '') {
            const warn = document.createElement('div')
            warn.className = 'textbox'
            warn.innerHTML = 'Ошибка 404<br>Страница не найдена'

            const box_img = document.createElement('div')
            box_img.className = 'textbox'
            const warn_img = document.createElement('img')
            warn_img.src = 'pics/Stop.png';
            warn_img.width = "800"
            warn_img.height = "200"

            box_img.appendChild(warn_img)
            section_main.append(warn, box_img)
            return '404'
        }
    }, 20);

    createTags()
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


function navMobile() {
    const navMenu = document.querySelector('nav');
    const navToggle = navMenu.querySelector('a');
    const navItems = navMenu.querySelectorAll('.second');

    let isMenuOpen = false
    let links = {}

    navMenu.querySelectorAll('a').forEach(link => {
        links[link.textContent] = link.attributes.getNamedItem('onclick').nodeValue
        link.onclick = ''
    })

    navToggle.addEventListener('click', (event) => {
        event.preventDefault()
        navMenu.classList.toggle('open')
        isMenuOpen = !isMenuOpen

        if (isMenuOpen) eval(links[event.target.textContent])
    })

    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.stopPropagation()
            const link = item.querySelector('a')
            if (link) {
                navMenu.classList.remove('open')
                eval(links[event.target.textContent])
            }
        })
    })

    document.addEventListener('click', (event) => {
        if (!navMenu.contains(event.target) && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open')
            isMenuOpen = false
        }
    })
}


document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.toggle input[type="checkbox"]')
    setInitialTheme()
    themeToggle.addEventListener('change', toggleTheme)

    if (isMobileDevice()) navMobile()

    const CurrentPageName = window.location.pathname.replace(/^(\/pages\/|\/)(.*)(.html)$/g, '$2')
    const CurrentHash = window.location.hash ? window.location.hash : false

    loadJsonData(CurrentHash || CurrentPageName)

    const searchInput = document.querySelector('input')
    const searchForm = document.querySelector('form')
    const clearBtn = document.querySelector('.clear-btn')

    if (searchInput && searchForm && clearBtn) {
        const performSearch = async () => {
            const value = searchInput.value
            if (value.length <= 0) {
                localStorage.removeItem('query')
                const pastPage = localStorage.getItem('pastPage')
                loadJsonData(pastPage || '/')
            } else {
                localStorage.setItem('query', value)
                showResults()
            }
        }

        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') e.preventDefault()
        })

        searchInput.addEventListener('input', function (e) {
            e.preventDefault()
            performSearch()
            searchInput.value = e.target.value.toLocaleLowerCase()

            clearBtn.style.display = searchInput.value.trim() !== '' ? 'block' : 'none'
        })

        clearBtn.addEventListener('click', (e) => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            performSearch()
        });
    }
})


async function createPageData(Data, Name) {
    const details = document.createElement('details')

    const summary = document.createElement('summary')
    summary.textContent = `${Name}`
    details.appendChild(summary)

    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    table.append(tbody)

    for (let i = 0; i < Data.length; i += 3) {
        const chunk = Data.slice(i, i + 3)
        tbody.appendChild(createLinksBlock(chunk))
    }

    details.appendChild(table)
    section_main.appendChild(details)
}

function createLinksBlock(chunk) {
    const row = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
        const cell = document.createElement('td');
        if (chunk[j]) {
            const [title, desc, url, tags, date] = chunk[j];

            const element_tags = document.createElement('div')
            element_tags.className = 'element-tags'
            element_tags.innerHTML = tags.split(', ').map(tag => `<span class="tag-chip">${tag.trim()}</span>`).join('')


            const element_date = document.createElement('div')
            element_date.className = 'element-date'
            element_date.innerHTML = date

            const link = document.createElement('a')
            link.innerHTML = `<p>${title}<br><br>${desc || ''}</p>`
            link.className = 'cell'
            link.target = '_blank'
            link.href = `${url == 'Stop' ? "#PageNotFound" : url}`

            if (tags != '') link.prepend(element_tags)
            if (date != '') link.appendChild(element_date)
            cell.append(link)
        }
        row.appendChild(cell);
    }
    return row;
}



async function createTags() {
    function GetListTags() {
        let tag_counts = {}

        section_main?.querySelectorAll('.cell').forEach(cell => {
            cell?.querySelector('.element-tags')
                ?.querySelectorAll('.tag-chip').forEach(tag => {
                    const tagName = tag.textContent
                    tag_counts[tagName] = (tag_counts[tagName] || 0) + 1
                })
        })

        return tag_counts || undefined
    }

    function GetTags() {
        const tags = Object.entries(GetListTags())
            .sort((a, b) => b[1] - a[1])
            .map(entry => `${entry[0]} (${entry[1]})`);

        return tags.join(', ') || undefined
    }


    section_tags.querySelector('#tags-container').innerHTML = ''

    GetTags()?.split(', ').forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag.trim()
        tagSpan.onclick = () => toggleTag(tagSpan);

        if (activeTags.includes(re_tag(tag.trim()))) {
            tagSpan.classList.add('active')
            section_tags.querySelector('#tags-container').prepend(tagSpan);
        }
        else section_tags.querySelector('#tags-container').appendChild(tagSpan);
    })

    section_tags.style.display = GetTags() ? 'flex' : 'none'
}

async function toggleTag(tag) {
    if (activeTags.indexOf(re_tag(tag.textContent)) == -1) {
        activeTags.push(re_tag(tag.textContent))
        tag.classList.add('active')
    } else {
        activeTags.splice(activeTags.indexOf(re_tag(tag.textContent)), 1)
        tag.classList.remove('active')
    }

    section_main.innerHTML = ''

    Object.keys(currentPageData).forEach(categoryName => {
        const data = currentPageData[categoryName]

        const filteredData = data.filter(item => {
            const tags = (item[3] == '' ? '' : item[3]).split(', ').map(t => t.trim())
            return activeTags.every(tag => tags.includes(tag))
        })

        if (filteredData.length > 0) {
            createPageData(filteredData, categoryName)
            createTags()
        }
    })

    section_main.querySelectorAll('details').forEach(detail => detail.open = activeTags[0] ? true : window.location.hash.includes('search') ? true : false)

    if (activeTags[0]) document.querySelector('#filter-status').textContent = `найдено: ${section_main.querySelectorAll('.cell').length}`
    else document.querySelector('#filter-status').textContent = ''
}


function re_tag(t) {
    return t.replace(/(.*) \(.*\)$/g, '$1')
}


function copy(element) {
    navigator.clipboard.writeText(element.textContent);
    alert("Текст скопирован!")
}


async function stats() {
    const dialog = document.querySelector('dialog')
    const info = document.querySelector('#stats_block')

    const response = await fetch(DATA_URL);
    const jsonData = await response.json();

    let counts = {}

    Object.keys(jsonData).forEach(js => {
        if (typeof jsonData[js] === 'object' && js.includes('data')) {
            Object.keys(jsonData[js]).forEach(sec => {
                counts[sec] = []
                Object.keys(jsonData[js][sec]).forEach(cat => {
                    jsonData[js][sec][cat].forEach(cell => {
                        counts[sec].push(cell)
                    })
                })
            })
        }
    })

    info.innerHTML = ''

    let total = 0

    Object.keys(counts).forEach(section => {
        const sec = document.createElement('div')
        sec.style = 'text-indent: 10px'
        sec.innerHTML = `• ${section}: ${counts[section].length}`
        info.appendChild(sec)
        total += counts[section].length
    })

    const el_total = document.createElement('div')
    el_total.innerHTML = `- Total: ${total}`
    el_total.style.color = `var(--active-text)`
    info.appendChild(el_total)

    dialog.showModal()

    const clickDialog = dialog.addEventListener('click', (e) => {
        if (e.target == dialog) {
            dialog.close()
            dialog.removeEventListener('click', clickDialog)
        }
    })
}



const scrollToUp = document.getElementById('scrollToUp')

scrollToUp.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
})

function checkScrollPosition() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercent = Math.floor(((scrollY / (documentHeight - windowHeight)) * 100).toFixed(1))

    if (!isMobileDevice()) scrollToUp.style.display = scrollPercent >= 25 ? 'flex' : 'none'
}

window.addEventListener('scroll', checkScrollPosition);