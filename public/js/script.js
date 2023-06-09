let btn = document.getElementById('fetch');
let content = document.getElementById('content');
btn.addEventListener('click', () => {
    fetch('/items').then(
        (response) => {
            return response.json();
        }
    ).then(
        (result) => {
            console.log(result);

            let div = document.createElement('div');
            div.classList.add('section');
            let a = document.createElement('a');
            a.href = 'x';
            a.innerText = '123';

            div.appendChild(a);
            content.appendChild(div);
        }
    )
})

