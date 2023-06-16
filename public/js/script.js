let btn = document.getElementById('fetch');
let content = document.getElementById('content');

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let page = urlParams.get('page');
if (page == null) page = 1;
let counter = page * 4;

let totalPages = content.dataset.pages;

btn.addEventListener('click', () => {
    fetch('/items', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            offset: counter,
        })
    }).then(
        (response) => {
            return response.json();
        }
    ).then(
        (result) => {
            counter += 4;
            for (let i = 0; i < result.length; i++) {
                renderItem(result[i]);
            }
            if(counter >= totalPages * 4) {
                console.log('all');
                btn.style.display = 'none';
            }
        }
    )
})

function renderItem(item) {
    let inp = document.createElement('input');
    inp.type = 'hidden';
    inp.value = item.id;
    inp.name = 'id';

    let btn = document.createElement('input');
    btn.classList.add('form-button');
    btn.type = 'submit';
    btn.value = 'Удалить';

    let img = document.createElement('img');
    img.src = ('img/' + item.image);
    img.classList.add('section__image');

    let h2 = document.createElement('h2');
    h2.classList.add('section__title');
    h2.innerText = item.title;

    let h3 = document.createElement('h3');
    h3.classList.add('section__category');
    h3.innerText = (1);

    let form = document.createElement('form');
    form.action = 'delete';
    form.method = 'post';

    form.appendChild(inp);
    form.appendChild(btn);

    let a = document.createElement('a');
    a.href = '/items/' + item.id;

    a.appendChild(h2);
    a.appendChild(img);

    let div = document.createElement('div');
    div.classList.add('section');

    div.appendChild(a);
    div.appendChild(form);

    content.appendChild(div);
}