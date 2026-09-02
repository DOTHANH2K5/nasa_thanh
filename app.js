const STORAGE_KEY = "nasa-space-viewer-favorites";


function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}


function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}


function updateFavoritesNav() {
  const favorites = getFavorites();
  const count = Object.keys(favorites).length;
  const link = document.querySelector(".favorites-link");
  const icon = document.querySelector("#favorites-nav-icon");
  const countLabel = document.querySelector("#favorites-nav-count");

  if (!link || !icon || !countLabel) return;

  link.classList.toggle("has-favorites", count > 0);
  icon.textContent = count > 0 ? "♥" : "♡";
  countLabel.textContent = String(count);
  countLabel.hidden = count === 0;
}


function entryKey(entry) {
  return `${entry.date || ""}::${entry.title || ""}`;
}


function updateFavoriteButton(button, isSaved) {
  button.classList.toggle("saved", isSaved);
  button.querySelector("span").textContent = isSaved ? "♥" : "♡";
  button.setAttribute(
    "aria-label",
    isSaved ? "お気に入りから削除" : "お気に入りに追加"
  );
}


function attachFavoriteButtons() {
  const favorites = getFavorites();

  document.querySelectorAll(".favorite-button[data-entry]").forEach((button) => {
    const entry = JSON.parse(button.dataset.entry);
    const key = entryKey(entry);

    updateFavoriteButton(button, Boolean(favorites[key]));

    button.addEventListener("click", () => {
      const currentFavorites = getFavorites();

      if (currentFavorites[key]) {
        delete currentFavorites[key];
      } else {
        currentFavorites[key] = entry;
      }

      saveFavorites(currentFavorites);
      updateFavoriteButton(button, Boolean(currentFavorites[key]));
      updateFavoritesNav();
    });
  });
}


function createFavoriteCard(entry, key) {
  const card = document.createElement("article");
  card.className = "card";

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "favorite-button saved";
  favoriteButton.setAttribute("aria-label", "お気に入りから削除");

  const heart = document.createElement("span");
  heart.setAttribute("aria-hidden", "true");
  heart.textContent = "♥";
  favoriteButton.appendChild(heart);

  const image = document.createElement("img");
  image.src = entry.media_type === "video" ? entry.thumbnail_url : entry.url;
  image.alt = entry.title || "NASA image";
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const date = document.createElement("time");
  date.dateTime = entry.date || "";
  date.textContent = entry.date || "DATE UNKNOWN";

  const title = document.createElement("h2");
  title.textContent = entry.title || "NASA Image";

  const explanation = document.createElement("p");
  explanation.textContent = entry.explanation || "";

  const source = document.createElement("a");
  source.className = "source-link";
  source.href = entry.hdurl || entry.url;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "NASAで見る ↗";

  body.append(date, title, explanation, source);
  card.append(favoriteButton, image, body);

  favoriteButton.addEventListener("click", () => {
    const favorites = getFavorites();
    delete favorites[key];
    saveFavorites(favorites);
    card.remove();
    updateFavoritesSummary();
    updateFavoritesNav();
  });

  return card;
}


function updateFavoritesSummary() {
  const gallery = document.querySelector("#favorites-gallery");
  if (!gallery) return;

  const count = gallery.children.length;
  const countLabel = document.querySelector("#favorite-count");
  const emptyMessage = document.querySelector("#favorites-empty");
  const albumActions = document.querySelector("#album-actions");

  countLabel.textContent = `${count} RESULTS`;
  emptyMessage.hidden = count > 0;
  albumActions.hidden = count === 0;
}


function renderFavorites() {
  const gallery = document.querySelector("#favorites-gallery");
  if (!gallery) return;

  const favorites = getFavorites();

  Object.entries(favorites).forEach(([key, entry]) => {
    gallery.appendChild(createFavoriteCard(entry, key));
  });

  updateFavoritesSummary();
}


attachFavoriteButtons();
renderFavorites();
updateFavoritesNav();


const downloadPdfButton = document.querySelector("#download-pdf");
const sharePdfButton = document.querySelector("#share-pdf");


async function createPdfBlob() {
  const entries = Object.values(getFavorites());

  if (!entries.length) {
    throw new Error("NO_FAVORITES");
  }

  const response = await fetch("/download/pdf", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({entries}),
  });

  if (!response.ok) {
    throw new Error("PDF_GENERATION_FAILED");
  }

  return response.blob();
}


function downloadPdfBlob(pdfBlob) {
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "my-nasa-album.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}


function setPdfButtonsBusy(isBusy) {
  if (downloadPdfButton) downloadPdfButton.disabled = isBusy;
  if (sharePdfButton) sharePdfButton.disabled = isBusy;
}


if (downloadPdfButton) {
  downloadPdfButton.addEventListener("click", async () => {
    const status = document.querySelector("#pdf-status");
    setPdfButtonsBusy(true);
    downloadPdfButton.textContent = "PDFを作成しています…";
    status.textContent = "NASA画像を取得しています。";

    try {
      const pdfBlob = await createPdfBlob();
      downloadPdfBlob(pdfBlob);
      status.textContent = "PDFアルバムを作成しました。";
    } catch (error) {
      status.textContent = error.message === "NO_FAVORITES"
        ? "お気に入り画像を選んでください。"
        : "PDFを作成できませんでした。もう一度お試しください。";
    } finally {
      setPdfButtonsBusy(false);
      downloadPdfButton.textContent = "PDFアルバムをダウンロード";
    }
  });
}


if (sharePdfButton) {
  sharePdfButton.addEventListener("click", async () => {
    const status = document.querySelector("#pdf-status");
    setPdfButtonsBusy(true);
    status.textContent = "シェア用PDFを作成しています。";

    try {
      const pdfBlob = await createPdfBlob();
      const pdfFile = new File(
        [pdfBlob],
        "my-nasa-album.pdf",
        {type: "application/pdf"}
      );

      if (navigator.share && navigator.canShare?.({files: [pdfFile]})) {
        await navigator.share({
          title: "MY NASA ALBUM",
          text: "NASA SPACE VIEWERで作った宇宙アルバムです。",
          files: [pdfFile],
        });
        status.textContent = "PDFアルバムをシェアしました。";
      } else {
        downloadPdfBlob(pdfBlob);
        status.textContent = "共有非対応のためPDFをダウンロードしました。";
      }
    } catch (error) {
      if (error.name === "AbortError") {
        status.textContent = "シェアをキャンセルしました。";
      } else {
        status.textContent = "PDFをシェアできませんでした。";
      }
    } finally {
      setPdfButtonsBusy(false);
    }
  });
}
