import { ClipboardCheck, Download, FileSpreadsheet, FileText, Filter, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Getasset, type AssetApiAsset } from "@/api/AssetApi/Getasset";
import { getDocuments, formatDocType, type DocumentRecord } from "@/api/DocumentApi/Document";
import { getMaintenanceRecords, type MaintenanceRecord } from "@/api/MaintenanceApi/MaintenanceApi";

type ReportKey = "asset-register" | "expiry-report" | "maintenance-report";

type ReportCard = {
  key: ReportKey;
  title: string;
  body: string;
  meta: string;
  Icon: LucideIcon;
};

type PdfReport = {
  title: string;
  subtitle: string;
  summary: Array<[string, string]>;
  headers: string[];
  rows: string[][];
  filename: string;
};

const reportCards: ReportCard[] = [
  {
    key: "asset-register",
    title: "Asset Register",
    body: "Comprehensive ledger of all active, retired, and pending assets across global branches.",
    meta: "Full register",
    Icon: ClipboardCheck,
  },
  {
    key: "expiry-report",
    title: "Expiry Report",
    body: "Forecast of warranty expirations, document renewals, and lifecycle decommissioning dates.",
    meta: "Warranty and documents",
    Icon: FileText,
  },
  {
    key: "maintenance-report",
    title: "Maintenance Report",
    body: "Analysis of repair costs, downtime logs, and scheduled preventative maintenance cycles.",
    meta: "Service records",
    Icon: UsersRound,
  },
];

const statusClass = (status: string) => {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (status === "EXPIRED" || status === "DECOMMISSIONED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
};

const money = (value?: number | string | null) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value ?? 0));

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const label = (value?: string | null) => (value ? value.replaceAll("_", " ") : "N/A");

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const daysUntil = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const days = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `${days} days`;
};

const downloadBlob = (content: BlobPart, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const buildAssetRows = (assets: AssetApiAsset[]) =>
  assets.map((asset) => [
    asset.assetCode,
    asset.name,
    label(asset.category),
    asset.department?.name ?? "Unassigned",
    asset.location ?? "N/A",
    label(asset.status),
    money(asset.valuation ?? asset.purchasePrice),
    asset.riskLevel ?? "N/A",
  ]);

const buildMaintenanceRows = (records: MaintenanceRecord[]) =>
  records.map((record) => [
    record.asset?.assetCode ?? String(record.assetId),
    record.asset?.name ?? "Asset not loaded",
    record.maintenanceType,
    record.vendorId ? `Vendor ${record.vendorId}` : "Internal",
    money(record.cost),
    formatDate(record.lastServiceDate),
    formatDate(record.nextServiceDate),
    label(record.status),
  ]);

const buildExpiryRows = (assets: AssetApiAsset[], documents: DocumentRecord[]) => {
  const warrantyRows = assets
    .filter((asset) => asset.warrantyExpiry)
    .map((asset) => [
      asset.assetCode,
      asset.name,
      "Asset Warranty",
      formatDate(asset.warrantyExpiry),
      daysUntil(asset.warrantyExpiry),
      label(asset.status),
    ]);

  const documentRows = documents
    .filter((doc) => doc.expiryDate)
    .map((doc) => [
      doc.asset?.assetCode ?? (doc.linkedAssetId ? String(doc.linkedAssetId) : "Unlinked"),
      doc.asset?.name ?? "Document",
      formatDocType(doc.docType),
      formatDate(doc.expiryDate),
      daysUntil(doc.expiryDate),
      label(doc.status),
    ]);

  return [...warrantyRows, ...documentRows].sort((first, second) => {
    const firstDate = new Date(first[3]).getTime();
    const secondDate = new Date(second[3]).getTime();
    return (Number.isNaN(firstDate) ? Infinity : firstDate) - (Number.isNaN(secondDate) ? Infinity : secondDate);
  });
};

const openPdfReport = (report: PdfReport) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const printedAt = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(report.title)}</title>
        <style>
          @page { size: A4 landscape; margin: 14mm; }
          * { box-sizing: border-box; }
          body { color: #11111a; font-family: Arial, sans-serif; margin: 0; }
          header { border-bottom: 3px solid #001970; margin-bottom: 20px; padding-bottom: 16px; }
          .eyebrow { color: #606475; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
          h1 { color: #001970; font-size: 28px; margin: 6px 0; }
          .subtitle { color: #30313d; font-size: 13px; margin: 0; }
          .summary { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); margin: 18px 0; }
          .metric { border: 1px solid #c7c4d8; padding: 10px; }
          .metric span { color: #606475; display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .metric strong { color: #001970; display: block; font-size: 20px; margin-top: 4px; }
          table { border-collapse: collapse; font-size: 11px; width: 100%; }
          th { background: #f0eef7; color: #30313d; font-size: 10px; text-transform: uppercase; }
          th, td { border: 1px solid #c7c4d8; padding: 8px; text-align: left; vertical-align: top; }
          tr:nth-child(even) td { background: #faf9fd; }
          footer { color: #606475; display: flex; font-size: 10px; justify-content: space-between; margin-top: 14px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="eyebrow">Sterling Assurance Asset Management System</div>
          <h1>${escapeHtml(report.title)}</h1>
          <p class="subtitle">${escapeHtml(report.subtitle)}</p>
        </header>
        <section class="summary">
          ${report.summary
            .map(([name, value]) => `<div class="metric"><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong></div>`)
            .join("")}
        </section>
        <table>
          <thead>
            <tr>${report.headers.map((head) => `<th>${escapeHtml(head)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${report.rows
              .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
              .join("")}
          </tbody>
        </table>
        <footer>
          <span>Generated: ${escapeHtml(printedAt)}</span>
          <span>${escapeHtml(report.filename)}</span>
        </footer>
        <script>
          document.title = ${JSON.stringify(report.filename)};
          window.addEventListener("load", () => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export default function Reports() {
  const [assets, setAssets] = useState<AssetApiAsset[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        const [assetResult, maintenanceResult, documentResult] = await Promise.all([
          Getasset(),
          getMaintenanceRecords(),
          getDocuments().catch(() => []),
        ]);

        if (!mounted) return;
        setAssets(assetResult.data?.assets ?? []);
        setMaintenance(maintenanceResult.data?.maintenanceRecords ?? []);
        setDocuments(documentResult);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  const assetRows = useMemo(() => buildAssetRows(assets), [assets]);
  const maintenanceRows = useMemo(() => buildMaintenanceRows(maintenance), [maintenance]);
  const expiryRows = useMemo(() => buildExpiryRows(assets, documents), [assets, documents]);

  const exportRows = assetRows.length > 0 ? assetRows : [["No assets", "", "", "", "", "", "", ""]];
  const assetHeaders = ["Asset ID", "Name", "Class", "Department", "Location", "Status", "Valuation", "Risk Level"];

  const reports = useMemo<Record<ReportKey, PdfReport>>(
    () => ({
      "asset-register": {
        title: "Asset Register",
        subtitle: "Complete register of assets with department, status, valuation, and risk details.",
        summary: [
          ["Total Assets", String(assets.length)],
          ["Active", String(assets.filter((asset) => asset.status === "ACTIVE").length)],
          ["Expired", String(assets.filter((asset) => asset.status === "EXPIRED").length)],
          ["Total Valuation", money(assets.reduce((total, asset) => total + Number(asset.valuation ?? asset.purchasePrice ?? 0), 0))],
        ],
        headers: assetHeaders,
        rows: exportRows,
        filename: "asset-register-report.pdf",
      },
      "expiry-report": {
        title: "Expiry Report",
        subtitle: "Warranty and document expiry schedule ordered by upcoming due dates.",
        summary: [
          ["Tracked Items", String(expiryRows.length)],
          ["Expired Assets", String(assets.filter((asset) => asset.status === "EXPIRED").length)],
          ["Expiring Soon", String(assets.filter((asset) => asset.status === "EXPIRING_SOON").length)],
          ["Documents", String(documents.length)],
        ],
        headers: ["Asset ID", "Asset / Document", "Expiry Type", "Expiry Date", "Time Left", "Status"],
        rows: expiryRows.length > 0 ? expiryRows : [["No expiry records", "", "", "", "", ""]],
        filename: "expiry-report.pdf",
      },
      "maintenance-report": {
        title: "Maintenance Report",
        subtitle: "Maintenance service records with cost, schedule, vendor, and status details.",
        summary: [
          ["Total Records", String(maintenance.length)],
          ["Scheduled", String(maintenance.filter((record) => record.status === "SCHEDULED").length)],
          ["Overdue", String(maintenance.filter((record) => record.status === "OVERDUE").length)],
          ["Total Cost", money(maintenance.reduce((total, record) => total + Number(record.cost ?? 0), 0))],
        ],
        headers: ["Asset ID", "Asset", "Maintenance Type", "Vendor", "Cost", "Last Service", "Next Service", "Status"],
        rows: maintenanceRows.length > 0 ? maintenanceRows : [["No maintenance records", "", "", "", "", "", "", ""]],
        filename: "maintenance-report.pdf",
      },
    }),
    [assetRows, assets, documents.length, expiryRows, exportRows, maintenance, maintenanceRows]
  );

  const exportCsv = () => {
    const csv = [assetHeaders, ...exportRows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    downloadBlob(csv, "asset-register-report.csv", "text/csv;charset=utf-8");
  };

  const exportExcel = () => {
    const table = `<table><thead><tr>${assetHeaders.map((head) => `<th>${escapeHtml(head)}</th>`).join("")}</tr></thead><tbody>${exportRows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
    downloadBlob(table, "asset-register-report.xls", "application/vnd.ms-excel");
  };

  const exportPdf = (key: ReportKey = "asset-register") => {
    openPdfReport(reports[key]);
  };

  return (
    <section className="mx-auto max-w-[1180px] space-y-7">
      <article className="rounded border border-[#c7c4d8] bg-white p-7">
        <div className="mb-7 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <Filter className="h-5 w-5 text-[#001970]" />
            Data Intelligence Filters
          </h1>
          <button className="font-bold text-[#001970]">Clear all filters</button>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {["Current Fiscal Year", "All Global Offices", "All Departments", "All Asset Classes"].map((value, index) => (
            <label className="grid gap-2 text-sm font-semibold" key={value}>
              {["Date Range", "Branch Location", "Department", "Asset Class"][index]}
              <select className="h-11 rounded border border-[#c7c4d8] bg-white px-4 font-normal">
                <option>{value}</option>
              </select>
            </label>
          ))}
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <article className="rounded border border-[#c7c4d8] bg-white p-7">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Asset Distribution</h2>
              <p>Live overview of asset allocation across classes</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="rounded bg-[#dbe8ff] px-3 py-1">Technology</span>
              <span className="rounded bg-[#dbe8ff] px-3 py-1">Infrastructure</span>
            </div>
          </div>
          <div className="flex h-72 items-end gap-6">
            {[55, 34, 72, 45, 78, 26].map((height, index) => (
              <div
                className={`w-full rounded-t ${index % 2 ? "bg-[#8195bd]" : "bg-[#c6cedd]"}`}
                key={height}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded bg-[#002174] p-7 text-white">
          <h2 className="text-2xl font-bold">Instant Export</h2>
          <p className="mt-5">Generated reports are formatted for institutional audit and PDF printing.</p>
          <div className="mt-8 space-y-4">
            <button
              className="flex h-14 w-full items-center gap-4 rounded border border-white/30 px-5 text-left font-bold disabled:opacity-60"
              disabled={loading}
              onClick={() => exportPdf("asset-register")}
              type="button"
            >
              <FileText className="h-5 w-5" />
              Audit-Ready PDF
            </button>
            <button
              className="flex h-14 w-full items-center gap-4 rounded border border-white/30 px-5 text-left font-bold disabled:opacity-60"
              disabled={loading}
              onClick={exportExcel}
              type="button"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Microsoft Excel (.xls)
            </button>
            <button
              className="flex h-14 w-full items-center gap-4 rounded border border-white/30 px-5 text-left font-bold disabled:opacity-60"
              disabled={loading}
              onClick={exportCsv}
              type="button"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Comma Separated (.csv)
            </button>
          </div>
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reportCards.map(({ key, title, body, meta, Icon }) => (
          <article className="rounded border border-[#c7c4d8] bg-white p-7" key={key}>
            <div className="mb-7 grid h-14 w-14 place-items-center rounded bg-[#e8f0ff]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-4 min-h-20">{body}</p>
            <div className="mt-7 flex items-center justify-between border-t border-[#c7c4d8] pt-5 text-sm">
              <span>{loading ? "Loading data..." : meta}</span>
              <button
                className="inline-flex items-center gap-2 font-bold text-[#001970] disabled:opacity-50"
                disabled={loading}
                onClick={() => exportPdf(key)}
                type="button"
              >
                <Download className="h-4 w-4" />
                PDF REPORT
              </button>
            </div>
          </article>
        ))}
      </div>
         //RECENT INTELLIGENCE REPORT
      <article className="overflow-hidden rounded border border-[#c7c4d8] bg-white">
        <h2 className="p-7 text-2xl font-bold">Recent Intelligence Logs</h2>
        <table className="w-full text-left">
          <thead className="bg-[#f0eef7] text-sm uppercase">
            <tr>
              {["Asset ID", "Class", "Location", "Status", "Valuation", "Risk Level"].map((head) => (
                <th className="px-7 py-4" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c7c4d8]">
            {exportRows.map((log) => (
              <tr key={log[0]}>
                <td className="px-7 py-5 font-bold text-[#001970]">{log[0]}</td>
                <td className="px-7 py-5">{log[2]}</td>
                <td className="px-7 py-5">{log[4]}</td>
                <td className="px-7 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(String(log[5]).replaceAll(" ", "_"))}`}>{log[5]}</span></td>
                <td className="px-7 py-5">{log[6]}</td>
                <td className="px-7 py-5">{log[7]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
