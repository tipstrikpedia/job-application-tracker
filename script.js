const form = document.getElementById("applicationForm");
const table = document.getElementById("applicationTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const exportButton = document.getElementById("exportButton");
const themeToggle = document.getElementById("themeToggle");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const totalCount = document.getElementById("totalCount");
const interviewCount = document.getElementById("interviewCount");
const acceptedCount = document.getElementById("acceptedCount");

let applications = JSON.parse(localStorage.getItem("applications")) || [];
let editingId = null;

applications = applications.map(app => ({
  id: app.id || crypto.randomUUID(),
  ...app
}));

function saveApplications() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

function getFormData() {
  return {
    company: document.getElementById("company").value.trim(),
    position: document.getElementById("position").value.trim(),
    country: document.getElementById("country").value.trim(),
    status: document.getElementById("status").value,
    date: document.getElementById("date").value,
    notes: document.getElementById("notes").value.trim()
  };
}

function fillForm(app) {
  document.getElementById("company").value = app.company;
  document.getElementById("position").value = app.position;
  document.getElementById("country").value = app.country;
  document.getElementById("status").value = app.status;
  document.getElementById("date").value = app.date;
  document.getElementById("notes").value = app.notes;
}

function resetFormMode() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add New Application";
  saveButton.textContent = "Save Application";
  cancelEditButton.classList.add("hidden");
}

function updateStats() {
  totalCount.textContent = applications.length;
  interviewCount.textContent = applications.filter(app => app.status === "Interview").length;
  acceptedCount.textContent = applications.filter(app => app.status === "Accepted").length;
}

function getFilteredApplications() {
  const keyword = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  return applications.filter(app => {
    const matchesKeyword =
      app.company.toLowerCase().includes(keyword) ||
      app.position.toLowerCase().includes(keyword) ||
      app.country.toLowerCase().includes(keyword) ||
      app.status.toLowerCase().includes(keyword) ||
      app.notes.toLowerCase().includes(keyword);

    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus;

    return matchesKeyword && matchesStatus;
  });
}

function renderApplications() {
  const filteredApplications = getFilteredApplications();
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

  filteredApplications.forEach(app => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${app.company}</td>
      <td>${app.position}</td>
      <td>${app.country}</td>
      <td><span class="status">${app.status}</span></td>
      <td>${app.date}</td>
      <td>${app.notes || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editApplication('${app.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteApplication('${app.id}')">Delete</button>
        </div>
      </td>
    `;

    table.appendChild(row);
  });

  updateStats();
}

function editApplication(id) {
  const app = applications.find(item => item.id === id);

  if (!app) return;

  editingId = id;
  fillForm(app);
  formTitle.textContent = "Edit Application";
  saveButton.textContent = "Update Application";
  cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteApplication(id) {
  const confirmed = confirm("Delete this application?");

  if (!confirmed) return;

  applications = applications.filter(app => app.id !== id);
  saveApplications();
  renderApplications();

  if (editingId === id) {
    resetFormMode();
  }
}

function exportToCSV() {
  if (applications.length === 0) {
    alert("No application data to export.");
    return;
  }

  const headers = ["Company", "Position", "Country", "Status", "Date", "Notes"];
  const rows = applications.map(app => [
    app.company,
    app.position,
    app.country,
    app.status,
    app.date,
    app.notes
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "job-applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const formData = getFormData();

  if (editingId) {
    applications = applications.map(app => {
      if (app.id === editingId) {
        return { ...app, ...formData };
      }

      return app;
    });
  } else {
    applications.push({
      id: crypto.randomUUID(),
      ...formData
    });
  }

  saveApplications();
  resetFormMode();
  renderApplications();
});

cancelEditButton.addEventListener("click", resetFormMode);
searchInput.addEventListener("input", renderApplications);
statusFilter.addEventListener("change", renderApplications);
exportButton.addEventListener("click", exportToCSV);
themeToggle.addEventListener("click", toggleTheme);

saveApplications();
loadTheme();
renderApplications();
