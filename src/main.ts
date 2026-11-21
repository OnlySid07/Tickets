import "./style.css";

type PaperWidth = "80" | "58";
type MessageSize = "normal" | "large" | "xlarge";

interface TicketData {
  title: string;
  number: string;
  message: string;
  footer: string;
  paper: PaperWidth;
  size: MessageSize;
  centerMessage: boolean;
  includeDate: boolean;
  dateText: string;
}

interface BuildOptions {
  preview?: boolean;
  pageHeightMm?: number;
}

const COUNTER_KEY = "ticket-next-number";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`No se encontró el elemento ${selector}`);
  }

  return element;
}

const form = getElement<HTMLFormElement>("#ticket-form");
const titleInput = getElement<HTMLInputElement>("#title");
const numberInput = getElement<HTMLInputElement>("#number");
const messageInput = getElement<HTMLTextAreaElement>("#message");
const footerInput = getElement<HTMLInputElement>("#footer");
const paperSelect = getElement<HTMLSelectElement>("#paper");
const sizeSelect = getElement<HTMLSelectElement>("#size");
const centerCheckbox = getElement<HTMLInputElement>("#center-message");
const dateCheckbox = getElement<HTMLInputElement>("#include-date");
const preview = getElement<HTMLIFrameElement>("#preview");
const paperBadge = getElement<HTMLSpanElement>("#paper-badge");
const printButton = getElement<HTMLButtonElement>("#print");
const clearButton = getElement<HTMLButtonElement>("#clear");
const nextNumberButton = getElement<HTMLButtonElement>("#next-number");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(date: Date): string {
  const locale = navigator.language.toLowerCase().startsWith("es")
    ? navigator.language
    : "es-MX";

  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function readForm(): TicketData {
  return {
    title: titleInput.value.trim(),
    number: numberInput.value.trim(),
    message: messageInput.value.replace(/\r\n/g, "\n"),
    footer: footerInput.value.trim(),
    paper: paperSelect.value as PaperWidth,
    size: sizeSelect.value as MessageSize,
    centerMessage: centerCheckbox.checked,
    includeDate: dateCheckbox.checked,
    dateText: formatDate(new Date()),
  };
}

function buildTicketHtml(data: TicketData, options: BuildOptions = {}): string {
  const is58 = data.paper === "58";
  const pageWidth = is58 ? "58mm" : "80mm";
  const pageHeightMm = options.pageHeightMm ?? 297;
  const padding = is58 ? "2mm 5mm 5mm" : "2mm 4mm 5mm";
  const baseFont = is58 ? "11px" : "12px";
  const titleSize = is58 ? "14px" : "16px";
  const numberSize = is58 ? "18px" : "20px";
  const largeSize = is58 ? "14px" : "16px";
  const xlargeSize = is58 ? "20px" : "24px";

  const hasMessage = data.message.trim().length > 0;
  const hasFooter = data.footer.length > 0;

  const headerParts: string[] = [];

  if (data.title) {
    headerParts.push(`<div class="title">${escapeHtml(data.title)}</div>`);
  }

  if (data.number) {
    headerParts.push(`<div class="number">${escapeHtml(data.number)}</div>`);
  }

  if (data.includeDate) {
    headerParts.push(`<div class="date">${escapeHtml(data.dateText)}</div>`);
  }

  const header = headerParts.length
    ? `<header class="ticket-header">${headerParts.join("")}</header>`
    : "";

  const message = hasMessage
    ? `<div class="message size-${data.size}${data.centerMessage ? " center" : ""}">${escapeHtml(data.message)}</div>`
    : "";

  const footer = hasFooter
    ? `<footer class="footer">${escapeHtml(data.footer)}</footer>`
    : "";

  const content: string[] = [];

  if (header) {
    content.push(header);
  }

  if (header && (message || footer)) {
    content.push('<div class="rule"></div>');
  }

  if (message) {
    content.push(message);
  }

  if ((header || message) && footer) {
    content.push('<div class="rule"></div>');
  }

  if (footer) {
    content.push(footer);
  }

  if (!content.length && options.preview) {
    content.push(
      '<div class="empty">Escribe algo para ver la vista previa…</div>',
    );
  }

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page {
    size: ${pageWidth} ${pageHeightMm}mm;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  html {
    background: #eef2f7;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    width: ${pageWidth};
    margin: 0 auto;
    padding: ${padding};
    background: #ffffff;
    color: #000000;
    font-family: "Courier New", "Lucida Console", monospace;
    font-size: ${baseFont};
    line-height: 1.3;
  }

  .ticket {
    width: 100%;
  }

  .ticket-header {
    text-align: center;
  }

  .title {
    font-size: ${titleSize};
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.2;
  }

  .number {
    margin-top: 1mm;
    font-size: ${numberSize};
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.15;
  }

  .date {
    margin-top: 1mm;
    font-size: ${baseFont};
  }

  .rule {
    margin: 2.5mm 0;
    border: 0;
    border-top: 1px dashed #000000;
  }

  .message {
    text-align: left;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .message.center {
    text-align: center;
  }

  .message.size-normal {
    font-size: ${baseFont};
  }

  .message.size-large {
    font-size: ${largeSize};
  }

  .message.size-xlarge {
    font-size: ${xlargeSize};
    font-weight: 700;
    line-height: 1.15;
  }

  .footer {
    text-align: center;
    font-size: ${baseFont};
    white-space: pre-wrap;
  }

  .empty {
    padding: 12mm 0;
    color: #64748b;
    font-size: ${baseFont};
    text-align: center;
  }

  @media screen {
    html {
      min-height: 100%;
    }

    body {
      margin: 16px auto;
      border-radius: 2px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }
  }

  @media print {
    html {
      background: #ffffff;
    }

    body {
      margin: 0 auto;
      border-radius: 0;
      box-shadow: none;
    }
  }
</style>
</head>
<body>
  <div class="ticket">${content.join("\n")}</div>
</body>
</html>`;
}

let previewSerial = 0;

function updatePreview(): void {
  const data = readForm();
  const html = buildTicketHtml(data, { preview: true });
  const serial = ++previewSerial;

  paperBadge.textContent = `${data.paper} mm`;

  preview.onload = () => {
    if (serial !== previewSerial) {
      return;
    }

    const doc = preview.contentDocument;

    if (!doc) {
      return;
    }

    const resize = () => {
      if (!preview.contentDocument) {
        return;
      }

      const bodyHeight = doc.body.getBoundingClientRect().height;
      const documentHeight = Math.max(
        doc.documentElement.scrollHeight,
        doc.body.scrollHeight,
        bodyHeight + 32,
      );

      preview.style.height = `${Math.max(documentHeight, 300)}px`;
    };

    resize();
    void doc.fonts.ready.then(resize).catch(() => undefined);
    window.setTimeout(resize, 120);
  };

  preview.srcdoc = html;
}

async function measureTicketHeight(html: string): Promise<number> {
  const iframe = document.createElement("iframe");

  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = [
    "position: fixed",
    "left: -10000px",
    "top: 0",
    "width: 800px",
    "height: 600px",
    "border: 0",
  ].join(";");

  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 2_000);

      iframe.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };

      iframe.srcdoc = html;
    });

    const doc = iframe.contentDocument;

    if (!doc) {
      return 100;
    }

    await doc.fonts.ready.catch(() => undefined);

    const bodyHeight = doc.body.getBoundingClientRect().height;
    const heightMm = (bodyHeight / 96) * 25.4;

    // 6 mm extra para que el corte no se coma la última línea.
    return Math.max(40, Math.ceil(heightMm + 6));
  } finally {
    iframe.remove();
  }
}

let isPrinting = false;

async function printTicket(): Promise<void> {
  if (isPrinting) {
    return;
  }

  const data = readForm();

  if (!data.title && !data.number && !data.message.trim() && !data.footer) {
    window.alert("Escribe algo antes de imprimir.");
    return;
  }

  isPrinting = true;
  printButton.disabled = true;

  try {
    const measuringHtml = buildTicketHtml(data);
    const pageHeightMm = await measureTicketHeight(measuringHtml);
    const html = buildTicketHtml(data, { pageHeightMm });

    const iframe = document.createElement("iframe");

    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = [
      "position: fixed",
      "left: -10000px",
      "top: 0",
      "width: 800px",
      "height: 600px",
      "border: 0",
    ].join(";");

    document.body.appendChild(iframe);

    const cleanup = () => {
      if (iframe.isConnected) {
        iframe.remove();
      }
    };

    iframe.onload = () => {
      const win = iframe.contentWindow;

      if (!win) {
        cleanup();
        return;
      }

      win.addEventListener("afterprint", cleanup, { once: true });

      const doPrint = () => {
        try {
          win.focus();
          win.print();
        } catch {
          cleanup();
        }
      };

      const fontsReady = win.document.fonts?.ready ?? Promise.resolve();

      void fontsReady
        .then(() => window.setTimeout(doPrint, 120))
        .catch(() => window.setTimeout(doPrint, 120));

      window.setTimeout(cleanup, 60_000);
    };

    iframe.srcdoc = html;
  } catch (error) {
    console.error(error);
    window.alert("No se pudo preparar el ticket para imprimir.");
  } finally {
    window.setTimeout(() => {
      isPrinting = false;
      printButton.disabled = false;
    }, 800);
  }
}

function readCounter(): number {
  try {
    const value = Number.parseInt(
      localStorage.getItem(COUNTER_KEY) ?? "1",
      10,
    );

    return Number.isFinite(value) && value > 0 ? value : 1;
  } catch {
    return 1;
  }
}

function writeCounter(value: number): void {
  try {
    localStorage.setItem(COUNTER_KEY, String(value));
  } catch {
    // Si el navegador bloquea localStorage, el contador sigue funcionando
    // a partir del valor visible en el campo.
  }
}

function useNextNumber(): void {
  const currentDigits = numberInput.value.replace(/\D/g, "");
  const current = currentDigits ? Number.parseInt(currentDigits, 10) : 0;
  const next = Math.max(readCounter(), current + 1, 1);

  numberInput.value = String(next).padStart(6, "0");
  writeCounter(next + 1);
  updatePreview();
  numberInput.focus();
  numberInput.select();
}

function resetForm(): void {
  titleInput.value = "MI EMPRESA";
  numberInput.value = "";
  messageInput.value = "";
  footerInput.value = "";
  paperSelect.value = "80";
  sizeSelect.value = "normal";
  centerCheckbox.checked = false;
  dateCheckbox.checked = true;
  updatePreview();
  messageInput.focus();
}

let previewTimer: number | undefined;

function schedulePreview(): void {
  if (previewTimer !== undefined) {
    window.clearTimeout(previewTimer);
  }

  previewTimer = window.setTimeout(updatePreview, 60);
}

form.addEventListener("input", schedulePreview);
form.addEventListener("change", schedulePreview);
form.addEventListener("submit", (event) => event.preventDefault());

printButton.addEventListener("click", () => {
  void printTicket();
});
clearButton.addEventListener("click", resetForm);
nextNumberButton.addEventListener("click", useNextNumber);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    void printTicket();
  }
});

updatePreview();
messageInput.focus();
