// api/documents.ts
// Thin API client for the /documents endpoints exposed by the Express router.

export type DocType =
  | "VEHICLE_INSURANCE"
  | "MAINTENANCE_AGREEMENT"
  | "VIRTUAL_CERTIFICATE"
  | "MOTOR_CLAIMS"
  | "PURCHASE_INVOICE";

export type DocStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PERMANENT";

export interface AssetSummary {
  id: number;
  assetCode: string;
  name: string;
  category: string;
  status: string;
}

export interface UploaderSummary {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: string;
}

export interface DocumentRecord {
  id: number;
  name: string;
  fileUrl: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  docType: DocType;
  linkedAssetId: number | null;
  expiryDate: string | null;
  status: DocStatus;
  isVerified: boolean;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
  asset?: AssetSummary | null;
  uploader?: UploaderSummary | null;
}

export interface CreateDocumentPayload {
  name: string;
  fileUrl: string;
  docType: DocType;
  uploadedBy: number;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  linkedAssetId?: number | null;
  expiryDate?: string | null;
  status?: DocStatus;
  isVerified?: boolean;
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload>;

// Vite-style env var. Swap for process.env.REACT_APP_API_URL if using CRA.
const viteEnv = import.meta.env as ImportMetaEnv & { VITE_API_URL?: string };
const API_BASE_URL: string =
  viteEnv.VITE_API_BASE_URL ??
  viteEnv.VITE_API_URL ??
  "http://localhost:3005";

async function handleResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

/** GET /documents — list all documents (with linked asset + uploader). */
export async function getDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE_URL}/document`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await handleResponse<{ documents: DocumentRecord[] }>(res);
  return data.documents;
}

/** GET /documents/:id — fetch a single document. */
export async function getDocumentById(id: number): Promise<DocumentRecord> {
  const res = await fetch(`${API_BASE_URL}/document/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await handleResponse<{ document: DocumentRecord }>(res);
  return data.document;
}

/** POST /documents/new-document — create a document record. */
export async function createDocument(
  payload: CreateDocumentPayload
): Promise<DocumentRecord> {
  const res = await fetch(`${API_BASE_URL}/document/new-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{
    document: DocumentRecord;
    message: string;
  }>(res);
  return data.document;
}

/** PUT /documents/:id — partial update. */
export async function updateDocument(
  id: number,
  payload: UpdateDocumentPayload
): Promise<DocumentRecord> {
  const res = await fetch(`${API_BASE_URL}/document/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{
    document: DocumentRecord;
    message: string;
  }>(res);
  return data.document;
}

/** DELETE /documents/:id */
export async function deleteDocument(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/document/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  await handleResponse<{ message: string }>(res);
}

// ---------- Display helpers ----------

const DOC_TYPE_LABELS: Record<DocType, string> = {
  VEHICLE_INSURANCE: "Vehicle Insurance",
  MAINTENANCE_AGREEMENT: "Maintenance Agreement",
  VIRTUAL_CERTIFICATE: "Virtual Certificate",
  MOTOR_CLAIMS: "Motor Claims",
  PURCHASE_INVOICE: "Purchase Invoice",
};

const STATUS_LABELS: Record<DocStatus, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
  PERMANENT: "Permanent",
};

export const STATUS_BADGE_CLASS: Record<DocStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRING_SOON: "bg-orange-100 text-orange-900",
  EXPIRED: "bg-rose-100 text-rose-700",
  PERMANENT: "bg-slate-100 text-slate-700",
};

export function formatDocType(docType: DocType): string {
  return DOC_TYPE_LABELS[docType] ?? docType;
}

export function formatStatusLabel(status: DocStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "Size: —";
  if (bytes < 1024) return `Size: ${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `Size: ${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `Size: ${mb.toFixed(1)} MB`;
  return `Size: ${(mb / 1024).toFixed(1)} GB`;
}

export function formatExpiryDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [amount, label] of units) {
    if (value < amount) {
      unit = label;
      break;
    }
    value = Math.floor(value / amount);
    unit = label;
  }
  return `${value}${unit} ago`;
}

/** GET /document?assetId=:assetId — list documents linked to one asset. */
export async function getDocumentsForAsset(assetId: number): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE_URL}/document?assetId=${encodeURIComponent(assetId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await handleResponse<{ documents: DocumentRecord[] }>(res);
  return data.documents;
}

export async function uploadDocumentFile(file: File): Promise<{
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string | null;
}> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE_URL}/document/upload`, {
    method: "POST",
    credentials: "include",
    body,
  });

  return handleResponse<{
    fileUrl: string;
    fileSizeBytes: number;
    mimeType: string | null;
  }>(res);
}
