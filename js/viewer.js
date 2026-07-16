async function loadDocument() {
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get("id");

  const titleElement = document.querySelector("#document-title");
  const container = document.querySelector("#viewer-container");

  if (!documentId) {
    showError("문서 정보가 올바르지 않습니다.");
    return;
  }

  try {
    const response = await fetch(SITE_CONFIG.apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "문서를 불러오지 못했습니다.");
    }

    const documentData = result.documents.find(
      item => item.id === documentId
    );

    if (!documentData) {
      showError("존재하지 않거나 공개되지 않은 문서입니다.");
      return;
    }

    titleElement.textContent = documentData.title;
    document.title = `${documentData.title} | 개인 프로젝트`;

    const iframe = document.createElement("iframe");

    iframe.className = "document-frame";
    iframe.src = documentData.publishUrl;
    iframe.title = documentData.title;
    iframe.loading = "eager";

    container.innerHTML = "";
    container.appendChild(iframe);

  } catch (error) {
    console.error(error);
    showError("문서를 불러오는 중 오류가 발생했습니다.");
  }
}

function showError(message) {
  const container = document.querySelector("#viewer-container");

  container.innerHTML = `
    <div class="empty-message">
      <p>${escapeHtml(message)}</p>
      <a href="./index.html">문서 목록으로 돌아가기</a>
    </div>
  `;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

loadDocument();