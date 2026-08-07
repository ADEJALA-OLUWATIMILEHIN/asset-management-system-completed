import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cloud, Download, Eye, FileText, Folder, Grid2X2, List, Loader2, Pencil, Save, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Getasset, type AssetApiAsset } from "@/api/AssetApi/Getasset";
import {
  formatDocType,
  formatExpiryDate,
  formatFileSize,
  formatStatusLabel,
  getDocuments,
  STATUS_BADGE_CLASS,
  timeAgo,
  updateDocument,
  type DocumentRecord,
  type DocStatus,
  type DocType,
} from "../api/DocumentApi/Document";

const TABS: Array<{ label: string; status: DocStatus | "ALL" }> = [
  { label: "All", status: "ALL" },
  { label: "Expiring Soon", status: "EXPIRING_SOON" },
  { label: "Expired", status: "EXPIRED" },
];

const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = [
  { value: "VEHICLE_INSURANCE", label: "Vehicle Insurance" },
  { value: "MAINTENANCE_AGREEMENT", label: "Maintenance Agreement" },
  { value: "VIRTUAL_CERTIFICATE", label: "Virtual Certificate" },
  { value: "MOTOR_CLAIMS", label: "Motor Claims" },
  { value: "PURCHASE_INVOICE", label: "Purchase Invoice" },

];

const STATUS_OPTIONS: DocStatus[] = ["ACTIVE", "EXPIRING_SOON", "EXPIRED", "PERMANENT"];

type EditForm = {
  id: number;
  name: string;
  docType: DocType;
  linkedAssetId: string;
  expiryDate: string;
  status: DocStatus;
};

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DocStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState<AssetApiAsset[]>([]);
  const [editingDoc, setEditingDoc] = useState<EditForm | null>(null);
  const [savingDoc, setSavingDoc] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDocuments();
    });
  }, [loadDocuments]);

  useEffect(() => {
    let mounted = true;

    Getasset().then((result) => {
      if (mounted) setAssets(result.data?.assets ?? []);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (doc: DocumentRecord) => {
    setEditingDoc({
      id: doc.id,
      name: doc.name,
      docType: doc.docType,
      linkedAssetId: doc.linkedAssetId ? String(doc.linkedAssetId) : "",
      expiryDate: doc.expiryDate ? doc.expiryDate.slice(0, 10) : "",
      status: doc.status,
    });
  };

  const saveDocument = async () => {
    if (!editingDoc || !editingDoc.name.trim()) return;

    setSavingDoc(true);
    setError(null);

    try {
      await updateDocument(editingDoc.id, {
        name: editingDoc.name.trim(),
        docType: editingDoc.docType,
        linkedAssetId: editingDoc.linkedAssetId ? Number(editingDoc.linkedAssetId) : null,
        expiryDate: editingDoc.expiryDate || null,
        status: editingDoc.status,
      });
      setEditingDoc(null);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update document");
    } finally {
      setSavingDoc(false);
    }
  };

  const summaries = useMemo(() => {
    const expiringSoon = documents.filter((d) => d.status === "EXPIRING_SOON").length;
    const expired = documents.filter((d) => d.status === "EXPIRED").length;
    return [
      { label: "Total Documents", value: String(documents.length), note: `${documents.length} on file`, Icon: Folder, critical: false },
      { label: "Expiring Soon", value: String(expiringSoon).padStart(2, "0"), note: "Requires Review", Icon: FileText, critical: false },
      { label: "Expired Docs", value: String(expired).padStart(2, "0"), note: "Critical Compliance Issue", Icon: FileText, critical: expired > 0 },
    ];
  }, [documents]);

  const storageUsedGb = useMemo(() => {
    const totalBytes = documents.reduce((sum, d) => sum + (d.fileSizeBytes ?? 0), 0);
    return totalBytes / 1024 ** 3;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesTab = activeTab === "ALL" || doc.status === activeTab;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        doc.name.toLowerCase().includes(term) ||
        (doc.asset?.name ?? "").toLowerCase().includes(term) ||
        (doc.asset?.assetCode ?? "").toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [documents, activeTab, searchTerm]);

  return (
    <section className="mx-auto max-w-[1060px]">
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <p className="text-lg">
            Home › <strong className="text-[#001970]">Documents</strong>
          </p>
          <h1 className="mt-2 text-lg">Document Repository</h1>
        </div>
        <Link to="/documents/new">
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-800">
             <Upload className="h-4 w-4" />
              Upload Document
            </button>
          </Link>
      </div>

      <div className="mb-7 grid gap-5 md:grid-cols-4">
        {summaries.map(({ label, value, note, Icon, critical }) => (
          <article className="rounded border border-[#c7c4d8] bg-white p-5" key={label}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg">{label}</p>
              <Icon className="h-6 w-6 text-[#8ba0ca]" />
            </div>
            <strong className="text-xl">{value}</strong>
            <p className={`mt-3 text-sm font-bold ${critical ? "text-[#c00000]" : "text-emerald-700"}`}>
              {note}
            </p>
          </article>
        ))}
        <article className="rounded bg-[#263f91] p-5 text-white">
          <div className="mb-4 flex justify-between">
            <p className="text-[#9db4fb]">Storage Used</p>
            <Cloud className="h-6 w-6 text-[#9db4fb]" />
          </div>
          <strong className="text-lg text-[#9db4fb]">{storageUsedGb.toFixed(1)} GB</strong>
          <div className="mt-5 h-2 rounded-full bg-white/25">
            <div
              className="h-2 rounded-full bg-white"
              style={{ width: `${Math.min(storageUsedGb, 100)}%` }}
            />
          </div>
        </article>
      </div>

      <article className="overflow-hidden rounded border border-[#c7c4d8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#c7c4d8] p-4">
          <div className="flex rounded bg-[#f0eef7] p-1 text-lg">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.status)}
                className={`px-5 py-3 ${activeTab === tab.status ? "bg-white font-bold text-[#001970]" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className="relative">
            <input
              className="h-11 w-80 rounded border border-[#c7c4d8] px-4"
              placeholder="Search by name or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <div className="flex gap-3">
            <button className="grid h-11 w-11 place-items-center rounded border border-[#c7c4d8] bg-[#f0eef7]">
              <List className="h-5 w-5" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded border border-[#c7c4d8]">
              <Grid2X2 className="h-5 w-5" />
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded border border-[#c7c4d8] px-5">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-[#606475]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading documents...
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-[#c00000]" />
            <p className="font-bold text-[#c00000]">{error}</p>
            <button
              onClick={loadDocuments}
              className="rounded border border-[#c7c4d8] px-5 py-2 text-sm font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-[#606475]">
            <FileText className="h-8 w-8" />
            <p className="font-bold">No documents match this view</p>
            <p className="text-sm">Try a different tab or search term.</p>
          </div>
        )}

        {!loading && !error && filteredDocuments.length > 0 && (
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#f0eef7] text-sm uppercase">
              <tr>
                {["Document Name", "Linked Asset", "Type", "Expiry Date", "Status", "Actions"].map((head) => (
                  <th className="px-7 py-5" key={head}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded bg-[#eef5ff] text-[#0056ff]">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <strong>{doc.name}</strong>
                        <p className="text-sm text-[#606475]">
                          {formatFileSize(doc.fileSizeBytes)} • Updated: {timeAgo(doc.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    {doc.asset?.name ?? "Unlinked"}
                    {doc.asset?.assetCode && (
                      <p className="text-xs uppercase tracking-widest text-[#606475]">{doc.asset.assetCode}</p>
                    )}
                  </td>
                  <td className="px-7 py-5 text-[#334f78]">{formatDocType(doc.docType)}</td>
                  <td className={`px-7 py-5 ${doc.status === "EXPIRED" ? "font-bold italic text-[#c00000]" : ""}`}>
                    {formatExpiryDate(doc.expiryDate)}
                  </td>
                  <td className="px-7 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[doc.status]}`}>
                      {formatStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex gap-4">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" aria-label="View document">
                        <Eye className="h-5 w-5" />
                      </a>
                      <a href={doc.fileUrl} download aria-label="Download document">
                        <Download className="h-5 w-5" />
                      </a>
                      <button aria-label={`Edit ${doc.name}`} onClick={() => startEdit(doc)} type="button">
                        <Pencil className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && filteredDocuments.length > 0 && (
          <p className="border-t border-[#c7c4d8] px-7 py-6 text-lg">
            Showing <strong>{filteredDocuments.length}</strong> of <strong>{documents.length}</strong> documents
          </p>
        )}
      </article>

      {editingDoc && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 px-4">
          <article className="w-full max-w-[620px] rounded border border-[#c7c4d8] bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#001970]">Edit Document</h2>
              <button className="grid h-9 w-9 place-items-center rounded hover:bg-[#f0eef7]" onClick={() => setEditingDoc(null)} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                Document Name
                <input
                  className="h-11 rounded border border-[#c7c4d8] px-3"
                  value={editingDoc.name}
                  onChange={(event) => setEditingDoc({ ...editingDoc, name: event.target.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Document Type
                <select
                  className="h-11 rounded border border-[#c7c4d8] px-3"
                  value={editingDoc.docType}
                  onChange={(event) => setEditingDoc({ ...editingDoc, docType: event.target.value as DocType })}
                >
                  {DOC_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Linked Asset
                <select
                  className="h-11 rounded border border-[#c7c4d8] px-3"
                  value={editingDoc.linkedAssetId}
                  onChange={(event) => setEditingDoc({ ...editingDoc, linkedAssetId: event.target.value })}
                >
                  <option value="">No linked asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.assetCode} - {asset.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Expiry Date
                <input
                  className="h-11 rounded border border-[#c7c4d8] px-3"
                  type="date"
                  value={editingDoc.expiryDate}
                  onChange={(event) => setEditingDoc({ ...editingDoc, expiryDate: event.target.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                Expiration Status
                <select
                  className="h-11 rounded border border-[#c7c4d8] px-3"
                  value={editingDoc.status}
                  onChange={(event) => setEditingDoc({ ...editingDoc, status: event.target.value as DocStatus })}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{formatStatusLabel(status)}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#c7c4d8] pt-5">
              <button className="rounded border border-[#c7c4d8] px-5 py-2 font-bold" onClick={() => setEditingDoc(null)} type="button">
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded bg-[#001970] px-5 py-2 font-bold text-white disabled:opacity-50"
                disabled={savingDoc || !editingDoc.name.trim()}
                onClick={saveDocument}
                type="button"
              >
                {savingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
