let allrepos = document.querySelector('tbody')

let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
const q = searchParams.get('q')

fetch(`/home/${q}`, {mode: 'cors'})
.then(response => response.json())
.then(json => json.map(j => {
    
    let tr = document.createElement('tr')
    tr.classList.add("border", "border-grey-dark", "border-solid", "bg-grey-light")
    allrepos.appendChild(tr)
    
    let checkCell    = document.createElement('td')
    let nameCell     = document.createElement('td')
    let forksCell    = document.createElement('td')
    let issueCell    = document.createElement('td')
    let privateCell  = document.createElement('td')
    let downloadCell = document.createElement('td')
    let deleteCell   = document.createElement('td')

    checkCell.classList.add('text-center')
    nameCell.classList.add('pl-6', 'w-auto')
    forksCell.classList.add('text-center')
    issueCell.classList.add('text-center')
    privateCell.classList.add('text-center')
    downloadCell.classList.add('text-center', 'p-2', 'w-1/5')
    deleteCell.classList.add('text-center', 'p-2', 'w-1/5')

    tr.appendChild(checkCell)
    tr.appendChild(nameCell)
    tr.appendChild(forksCell)
    tr.appendChild(issueCell)
    tr.appendChild(privateCell)
    tr.appendChild(downloadCell)
    tr.appendChild(deleteCell)

    //////////////////////////////////////

    // CHECK CELL
    let check = document.createElement('input')
    check.type = "checkbox"   
    checkCell.appendChild(check)

    // NAME CELL
    nameCell.innerHTML = `<a href="${j.html_url}" target="_blank">${j.name}</a>`
    tr.appendChild(nameCell)

    // FORK CELL
    if(j.forks_count === 0) {
        forksCell.classList.add("text-orange")
        forksCell.innerHTML = "false";
    } else {
        forksCell.innerHTML = j.forks_count;
    }

    tr.appendChild(forksCell)

    // ISSUE CELL
    if(j.open_issues_count === 0) {
        issueCell.classList.add("text-green")
        issueCell.innerHTML = "none";
    } else {
        issueCell.innerHTML = j.open_issues_count;
    }
    tr.appendChild(issueCell)

    // PRIVATE CELL
    privateCell.innerHTML = j.private

    if(j.private == true) {
        privateCell.classList.add("text-green")
    } else {
        privateCell.classList.add("text-orange")
    }

    tr.appendChild(privateCell)

    // DOWNLOAD CELL

    fetch(`/branches/${j.owner.login}/${j.name}`)
    .then(response1 => response1.json())
    .then(json1 => json1.map(x => {
        let btn1 = document.createElement('button')
        btn1.classList.add ('block', 'bg-blue', 'px-4', 'py-2', 'mb-2', 'text-white', 'hover:bg-blue-dark', 'rounded-lg', 'text-sm', 'w-full')
        btn1.innerHTML = `${x.name}`

        btn1.addEventListener('click', function () {
            window.open(`https://github.com/${j.login}/${j.name}/archive/${x.name}.zip`, '_blank');
        })

        downloadCell.appendChild(btn1)
    }))
    .catch(err => console.log(err))

    tr.appendChild(downloadCell)

    // DELETE CELL
    let btn2 = document.createElement('button')
    btn2.classList.add ('bg-red', 'px-4', 'py-2', 'text-white', 'hover:bg-red-dark', 'rounded-lg', 'text-sm', 'w-full')
    btn2.innerHTML = "DELETE"

    btn2.addEventListener('click', function () {
        if(confirm('This will permanently remove the repository')) {
            window.open(`https://api.github.com/${j.owner.login}/${j.name}/archive/${x.name}.zip`, '_blank');
        } 
    })

    deleteCell.appendChild(btn2)
    tr.appendChild(deleteCell)

}))