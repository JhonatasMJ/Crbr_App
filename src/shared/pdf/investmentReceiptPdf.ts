import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import {
  buildInvestmentReceiptFileName,
  buildInvestmentReceiptLayout,
} from "@/shared/pdf/investmentReceiptLayout";
import { colors } from "@/themes/colors";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function receiptRowHtml(
  label: string,
  value: string,
  highlightValue = false,
): string {
  const valueClass = highlightValue ? "value value-highlight" : "value";
  return `
    <div class="row">
      <span class="label">${escapeHtml(label)}</span>
      <span class="${valueClass}">${escapeHtml(value)}</span>
    </div>
  `;
}

export function buildInvestmentReceiptHtml(receipt: InvestmentReceiptData): string {
  const layout = buildInvestmentReceiptLayout(receipt);

  const headerRows = layout.headerRows
    .map((row) =>
      receiptRowHtml(row.label, row.value, row.label === "Valor"),
    )
    .join("");

  const sections = layout.sections
    .map(
      (section) => `
        <div class="section-title">${escapeHtml(section.title)}</div>
        ${section.rows.map((row) => receiptRowHtml(row.label, row.value)).join("")}
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: ${colors.background};
            color: ${colors.foreground};
            padding: 24px;
          }
          .receipt { max-width: 480px; margin: 0 auto; }
          .head {
            border-bottom: 1px solid #262626;
            padding: 0 0 20px;
            margin-bottom: 0;
          }
          .head h1 {
            font-size: 22px;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 8px;
            color: ${colors.foreground};
          }
          .head p {
            font-size: 12px;
            color: #737373;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #262626;
          }
          .label {
            font-size: 15px;
            font-weight: 700;
            color: ${colors.foreground};
            flex-shrink: 0;
          }
          .value {
            font-size: 15px;
            color: #a3a3a3;
            text-align: right;
            word-break: break-word;
            max-width: 55%;
          }
          .value-highlight {
            color: ${colors.primary};
            font-weight: 700;
          }
          .section-title {
            background: ${colors.secondary};
            padding: 10px 16px;
            border-bottom: 1px solid #262626;
            font-size: 13px;
            font-weight: 600;
            color: #737373;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="head">
            <h1>${escapeHtml(layout.title)}</h1>
            <p>${escapeHtml(layout.timestamp)}</p>
          </div>
          ${headerRows}
          ${sections}
        </div>
      </body>
    </html>
  `;
}

async function prepareReceiptPdfUri(
  tempUri: string,
  receipt: InvestmentReceiptData,
): Promise<string> {
  const fileName = buildInvestmentReceiptFileName(receipt.investorName);
  const cacheDir = FileSystem.cacheDirectory;

  if (!cacheDir) {
    return tempUri;
  }

  const destUri = `${cacheDir}${fileName}`;
  const existing = await FileSystem.getInfoAsync(destUri);

  if (existing.exists) {
    await FileSystem.deleteAsync(destUri, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
}

export async function shareInvestmentReceiptPdf(
  receipt: InvestmentReceiptData,
): Promise<void> {
  const html = buildInvestmentReceiptHtml(receipt);
  const { uri: tempUri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const shareUri = await prepareReceiptPdfUri(tempUri, receipt);
  const fileName = buildInvestmentReceiptFileName(receipt.investorName);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Compartilhamento não disponível neste dispositivo");
  }

  await Sharing.shareAsync(shareUri, {
    UTI: "com.adobe.pdf",
    mimeType: "application/pdf",
    dialogTitle: fileName.replace(/\.pdf$/i, ""),
  });
}
