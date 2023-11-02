const token = document.getElementById('token').value;
const user = JSON.parse(document.getElementById('user').value);

const pageSize = 100;
let page = 1;

// Function to fetch and render the next page of starred repositories
function fetchAndRenderStars() {
  const url = `https://api.github.com/users/${user.login}/starred?per_page=${pageSize}&page=${page}`;
  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        // No more repositories to fetch
        hideSpinner();
        removeInfoBox();
        return;
      }
      renderStars(data);
      page++;
      setTimeout(fetchAndRenderStars, 1000); // Fetch the next page after a delay
    });
}

// Function to render the fetched repositories
function renderStars(stars) {
  const table = document.getElementById('controlled'); // Get the table element
  const tbody = table.querySelector('tbody'); // Get the tbody element

  stars.forEach(star => {
    // Create table rows and cells for each repository
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdDescription = document.createElement('td');
    const tdLanguage = document.createElement('td');
    const tdLink = document.createElement('td');
    const tdUnstar = document.createElement('td');
    const a = document.createElement('a');
    const button = document.createElement('button');

    // Apply Bootstrap classes for styling
    tr.classList.add('table-light');
    tdName.classList.add('fw-bold');
    a.classList.add('btn', 'btn-link', 'text-primary');
    tdUnstar.classList.add('text-center'); // Center-align the button

    // Add Font Awesome icons
    const unstarIcon = document.createElement('i');
    unstarIcon.classList.add('fas', 'fa-star');
    button.appendChild(unstarIcon);

    tdName.textContent = star.name || 'No Name';
    tdDescription.textContent = star.description || 'No Description';
    tdLanguage.textContent = star.language || 'No Language';
    a.textContent = 'View on GitHub';
    a.href = star.html_url;
    button.classList.add('btn', 'btn-danger'); // Apply Bootstrap danger button style

    // Add an event listener for the Unstar button
    button.addEventListener('click', () => {
      fetch(`https://api.github.com/user/starred/${star.full_name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`
        }
      })
        .then(res => {
          if (res.status === 204) {
            tr.remove();
          }
        });
    });

    tdLink.appendChild(a);
    tdUnstar.appendChild(button);

    tr.appendChild(tdName);
    tr.appendChild(tdDescription);
    tr.appendChild(tdLanguage);
    tr.appendChild(tdLink);
    tr.appendChild(tdUnstar);
    tbody.appendChild(tr); // Append the row to the tbody
  });

  // Show the table if it was hidden
  if (table.style.display === 'none') {
    table.style.display = 'table';
  }
}

// Hide the table until everything is done
document.getElementById('controlled').style.display = 'none';

// Function to hide the spinner and display the table
function hideSpinner() {
  document.getElementById('controlled').style.display = 'table';
  // Create a new button to download the CSV
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'mb-3');
  button.id = 'download-csv';
  button.textContent = 'Download CSV';
  button.addEventListener('click', generateCSV);
  // Add to container before the table
  const container = document.getElementById('container');
  container.insertBefore(button, container.firstChild);

}

// Function to remove the "infobox" div
function removeInfoBox() {
  const infobox = document.getElementById('infobox');
  if (infobox) {
    infobox.remove();
  }
}

function generateCSV() {
  const table = document.getElementById('controlled');
  const rows = table.querySelectorAll('tbody tr');
  // wait for the rows to be rendered, then generate the CSV (set the button to spinner)
  const button = document.getElementById('download-csv');
  button.classList.remove('btn-primary');
  button.classList.add('btn-secondary');
  button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

  // wait for the rows to be rendered
  setTimeout(() => {
    let csv = 'Name,Description,Language,Link\n';
    rows.forEach(row => {
      const name = row.querySelector('td:nth-child(1)').textContent;
      const description = row.querySelector('td:nth-child(2)').textContent;
      const language = row.querySelector('td:nth-child(3)').textContent;
      const link = row.querySelector('td:nth-child(4) a').href;
      csv += `"${name}","${description}","${language}","${link}"\n`;
    });
    // Create a temporary link to download the CSV
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = 'stars.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Reset the button
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');
    button.textContent = 'Download CSV';
  }, 1000);

}

// Start fetching and rendering the starred repositories
fetchAndRenderStars();
