function init() {
    const btnToggle = document.getElementById('menu');
    const nav = document.getElementById('nav');

    btnToggle.addEventListener('click', () => {
        nav.classList.toggle('hidden');
    })
}


export default { init }