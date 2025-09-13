(function () {
  "use strict";

  var fileInput = document.getElementById("file-input");
  var uploadButton = document.getElementById("upload-button");
  var clearButton = document.getElementById("clear-button");
  var dropZone = document.getElementById("drop-zone");
  var selectedList = document.getElementById("selected-list");
  var filesList = document.getElementById("files-list");

  var selectedFiles = [];

  function formatBytes(bytes) {
    var units = ["B", "KB", "MB", "GB", "TB"];
    if (!bytes) return "0 B";
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    var value = bytes / Math.pow(1024, i);
    return value.toFixed(value < 10 && i > 0 ? 1 : 0) + " " + units[i];
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString();
    } catch (_e) {
      return iso;
    }
  }

  function setButtonsState() {
    var has = selectedFiles.length > 0;
    uploadButton.disabled = !has;
    clearButton.disabled = !has;
  }

  function renderSelectedFiles() {
    selectedList.innerHTML = "";
    selectedFiles.forEach(function (file, index) {
      var item = document.createElement("div");
      item.className = "selected-item";
      item.innerHTML = '<div><div class="file-name">' + file.name + '</div><div class="file-meta">' + formatBytes(file.size) + '</div></div>' +
        '<div style="display:flex; gap:8px; align-items:center">' +
        '<button class="button" data-remove="' + index + '">Remove</button>' +
        '</div>' +
        '<div class="progress" style="grid-column: 1 / -1; display:none"><span></span></div>';
      selectedList.appendChild(item);
    });
    selectedList.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-remove"), 10);
        selectedFiles.splice(idx, 1);
        renderSelectedFiles();
        setButtonsState();
      });
    });
  }

  function addFiles(files) {
    var maxFiles = 50;
    var toAdd = Array.prototype.slice.call(files || []);
    var remaining = Math.max(0, maxFiles - selectedFiles.length);
    if (toAdd.length > remaining) {
      toAdd = toAdd.slice(0, remaining);
    }
    if (toAdd.length === 0) return;
    selectedFiles = selectedFiles.concat(toAdd);
    renderSelectedFiles();
    setButtonsState();
  }

  function uploadSequential() {
    if (selectedFiles.length === 0) return;
    uploadButton.disabled = true;
    clearButton.disabled = true;
    var items = Array.prototype.slice.call(selectedList.children);

    function uploadOne(index) {
      if (index >= selectedFiles.length) {
        selectedFiles = [];
        renderSelectedFiles();
        setButtonsState();
        fetchFiles();
        return;
      }
      var file = selectedFiles[index];
      var item = items[index];
      var barContainer = item.querySelector(".progress");
      var bar = barContainer.querySelector("span");
      barContainer.style.display = "block";

      var formData = new FormData();
      formData.append("files", file);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
          var percent = Math.round((e.loaded / e.total) * 100);
          bar.style.width = percent + "%";
        }
      });

      xhr.addEventListener("load", function () {
        uploadOne(index + 1);
      });
      xhr.addEventListener("error", function () {
        uploadOne(index + 1);
      });
      xhr.send(formData);
    }

    uploadOne(0);
  }

  function fetchFiles() {
    fetch("/api/files")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        renderFiles(data.files || []);
      })
      .catch(function () {
        filesList.innerHTML = "<div class=\"file-meta\">Unable to load files.</div>";
      });
  }

  function renderFiles(files) {
    if (!files || files.length === 0) {
      filesList.innerHTML = "<div class=\"file-meta\">No files yet. Upload to get started.</div>";
      return;
    }
    filesList.innerHTML = "";
    files.forEach(function (f) {
      var row = document.createElement("div");
      row.className = "file-row";
      row.innerHTML =
        '<div><div class="file-name">' + (f.originalName || f.storedName) + '</div>' +
        '<div class="file-meta">' + formatBytes(f.size) + ' • ' + formatDate(f.uploadDate) + '</div></div>' +
        '<a class="button" href="/api/files/' + f.id + '/download">Download</a>' +
        '<button class="button danger" data-delete="' + f.id + '">Delete</button>' +
        '<div class="file-actions"></div>';
      filesList.appendChild(row);
    });
    filesList.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-delete");
        fetch("/api/files/" + id, { method: "DELETE" })
          .then(function () { fetchFiles(); })
          .catch(function () { fetchFiles(); });
      });
    });
  }

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", function () {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    addFiles(e.dataTransfer.files);
  });
  dropZone.addEventListener("click", function () { fileInput.click(); });

  fileInput.addEventListener("change", function () {
    addFiles(fileInput.files);
    fileInput.value = "";
  });

  uploadButton.addEventListener("click", uploadSequential);
  clearButton.addEventListener("click", function () {
    selectedFiles = [];
    renderSelectedFiles();
    setButtonsState();
  });

  fetchFiles();
})();

