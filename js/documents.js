let allDocuments = [];
let allCategories = [];
let activeCategory = "all";

async function loadDocuments() {
  const list = document.querySelector("#document-list");

  try {
    const response = await fetch(SITE_CONFIG.apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "문서 목록을 불러오지 못했습니다.");
    }

    allDocuments = Array.isArray(result.documents)
      ? result.documents
      : [];

     allCategories = Array.isArray(result.categories)
      ? result.categories
      : [];

    renderCategoryTabs();
    renderFilteredDocuments();

  } catch (error) {
    console.error(error);

    list.innerHTML = `
      <div class="empty-message">
        <p>문서를 불러오지 못했습니다.</p>
        <button type="button" id="retry-button">
          다시 시도
        </button>
      </div>
    `;

    document
      .querySelector("#retry-button")
      ?.addEventListener("click", loadDocuments);
  }
}
function renderCategoryTabs() {
  const container = document.querySelector("#category-tabs");

  if (!container) {
    return;
  }

  const tabItems = [
    {
      key: "all",
      label: "전체"
    },
    ...allCategories
  ];

  container.innerHTML = "";

  tabItems.forEach(category => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "category-tab";
    button.dataset.category = category.key;
    button.textContent = category.label;

    if (category.key === activeCategory) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      activeCategory = category.key;

      document
        .querySelectorAll(".category-tab")
        .forEach(tab => {
          tab.classList.toggle(
            "is-active",
            tab.dataset.category === activeCategory
          );
        });

      renderFilteredDocuments();
    });

    container.appendChild(button);
  });
}
function renderFilteredDocuments() {
  const list = document.querySelector("#document-list");

  const filteredDocuments =
    activeCategory === "all"
      ? allDocuments
      : allDocuments.filter(
          documentData =>
            documentData.category === activeCategory
        );

  renderDocuments(filteredDocuments, list);
}

function setupCategoryTabs() {
  const tabs = document.querySelectorAll(".category-tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category || "all";

      tabs.forEach(item => {
        item.classList.toggle(
          "is-active",
          item === tab
        );
      });

      renderFilteredDocuments();
    });
  });
}

function renderDocuments(documents, container) {
  if (!Array.isArray(documents) || documents.length === 0) {
    container.innerHTML = `
      <p class="empty-message">
        이 카테고리에 공개된 문서가 없습니다.
      </p>
    `;
    return;
  }

  container.innerHTML = "";

  documents.forEach(documentData => {
    const card = document.createElement("a");

    card.className = "document-card";
    card.href = `./document.html?id=${encodeURIComponent(documentData.id)}`;

    const thumbnail = documentData.thumbnail
  ? `images/${documentData.thumbnail}`
  : SITE_CONFIG.defaultThumbnail;

    card.innerHTML = `
      <div class="document-thumbnail">
        <img
          src="${escapeHtml(thumbnail)}"
          alt=""
          loading="lazy"
        >
      </div>

      <div class="document-info">
        <span class="document-category">
          ${getCategoryLabel(documentData.category)}
        </span>

        <h2>${escapeHtml(documentData.title)}</h2>

        ${
          documentData.description
            ? `<p>${escapeHtml(documentData.description)}</p>`
            : ""
        }

        <time datetime="${escapeHtml(documentData.updatedAt)}">
          ${formatDate(documentData.updatedAt)}
        </time>
      </div>
    `;

    container.appendChild(card);
  });
}

function getCategoryLabel(categoryKey) {
  const category = allCategories.find(
    item => item.key === categoryKey
  );

  return category?.label || categoryKey || "기타";
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

loadDocuments();