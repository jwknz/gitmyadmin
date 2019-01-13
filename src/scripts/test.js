let allrepos = document.querySelector('tbody')

let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
const user = searchParams.get('user')

fetch(`/home/${user}`, {mode: 'cors'})
.then(response => response.json())
.then(json => console.log(json))