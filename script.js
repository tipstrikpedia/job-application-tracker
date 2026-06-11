const form = document.getElementById("applicationForm");
const table = document.getElementById("applicationTable");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const interviewCount = document.getElementById("interviewCount");
const acceptedCount = document.getElementById("acceptedCount");

let applications = JSON.parse(localStorage.getItem("applications")) || [];

function saveApplications() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

function updateStats() {
  totalCount.textContent = applications.length;
  interviewCount.textContent = applications.filter(app => app.status === "Interview").length;
  acceptedCount.textContent = applications.filter(app => app.status === "Accepted").length;
}

function renderApplications() {
  const keyword = searchInput.value.toLowerCase();

  const filteredApplications = applications.filter(app => {
    return (
      app.company.toLowerCase().includes(keyword) ||
      app.position.toLowerCase().includes(keyword) ||
      app.country.toLowerCase().includes(keyword) ||
      app.status.toLowerCase().includes(keyword)
    );
  });

  table.innerHTML = "";

  if (filteredApplications.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="7">No applications found.</td>
      </tr>
    `;
    updateStats();
    return;
  }

  filteredApplications.forEach((app, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${app.company}</td>
      <td>${app.position}</td>
      <td>${app.country}</td>
      <td><span class="status">${app.status}</span></td>
      <td>${app.date}</td>
      <td>${app.notes || "-"}</td>
      <td><button class="delete-btn" onclick="deleteApplication(${index})">Delete</button></td>
    `;

    table.appendChild(row);
  });

  updateStats();
}

function deleteApplication(index) {
  applications.splice(index, 1);
  saveApplications();
  renderApplications();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const newApplication = {
    company: document.getElementById("company").value.trim(),
    position: document.getElementById("position").value.trim(),
    country: document.getElementById("country").value.trim(),
    status: document.getElementById("status").value,
    date: document.getElementById("date").value,
    notes: document.getElementById("notes").value.trim()
  };

  applications.push(newApplication);
  saveApplications();
  form.reset();
  renderApplications();
});

searchInput.addEventListener("input", renderApplications);

renderApplications();
