
const thedata = 'data.json'

const navMenu = document.getElementById('nav')

function openNavMenu() {
    const openNav = document.querySelector('#nav > span')
    const nav = document.getElementById('nav')
    openNav.classList.toggle('active')
    nav.classList.toggle('open')
}


async function fetchJsonData(data, type) {
    try {
        const response = await fetch(`${data}`);
        if (type && type == 'text') return await response.text();
        else return await response.json();
    } catch (error) {
        console.error(`Ошибка загрузки JSON [${data}]:`, error);
        return null;
    }
}



function toPage(el, page) {
    const title = document.querySelector('#main header h1')
    const newTitle = el.textContent
    title.textContent = newTitle
}



document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchJsonData(thedata)

    data.navs.forEach(nav => {
        const nav_row = document.createElement('div')
        const nav_span = document.createElement('span')
        const nav_p = document.createElement('p')
        const nav_text = nav[0]
        const nav_link = nav[1]
        nav_span.textContent = '>'
        nav_p.textContent = nav_text
        nav_p.addEventListener('click', function () { toPage(this, nav_link) })

        nav_row.append(nav_span, nav_p)
        navMenu.append(nav_row)
    })

    const onm = document.createElement('span')
    onm.addEventListener('click', () => openNavMenu())
    onm.textContent = '>'
    navMenu.append(onm)

    openNavMenu()
})


const search = document.getElementById('search')
const submit = document.getElementById('submit')

search.addEventListener('input', function () {

    if (this.value.trim() !== '') submit.classList.add('active')
    else submit.classList.remove('active')
})


submit.addEventListener('click', () => {
    if (search.value.trim() !== '') Search(search.value.trim())
})


search.addEventListener('keydown', function (event) {
    if (search.value.trim() !== '' && event.key == 'Enter') {
        event.preventDefault()
        Search(search.value.trim())
    }
})





function Search(content) {
    alert(`По запросу "${content}" ничего не найдено`)
}