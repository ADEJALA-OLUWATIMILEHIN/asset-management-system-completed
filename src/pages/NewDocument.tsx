import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Upload, UploadCloud } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Getasset,
  type AssetApiAsset,
} from "@/api/AssetApi/Getasset";
import { getUsers } from "@/api/Getusers";
import {
  createDocument,
  uploadDocumentFile,
  type CreateDocumentPayload,
  type DocStatus,
  type DocType,
} from "../api/DocumentApi/Document";

const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = [
  { value: "VEHICLE_INSURANCE", label: "Vehicle Insurance" },
  { value: "MAINTENANCE_AGREEMENT", label: "Maintenance Agreement" },
  { value: "VIRTUAL_CERTIFICATE", label: "Virtual Certificate" },
  { value: "MOTOR_CLAIMS", label: "Motor Claims" },
  { value: "PURCHASE_INVOICE", label: "Purchase Invoice" },
];

const STATUS_OPTIONS: DocStatus[] = ["ACTIVE", "EXPIRING_SOON", "EXPIRED", "PERMANENT"];

export default function NewDocument() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState<DocType | "">("");
  const [linkedAssetId, setLinkedAssetId] = useState(searchParams.get("assetId") ?? "");
  const [assets, setAssets] = useState<AssetApiAsset[]>([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<DocStatus>("ACTIVE");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([Getasset(), getUsers()])
      .then(([assetResult, userResult]) => {
        if (!mounted) return;
        setAssets(assetResult.data?.assets ?? []);
        const activeUser =
          userResult.data?.users.find((user) => user.status === "ACTIVE") ??
          userResult.data?.users[0] ??
          null;
        setCurrentUserId(activeUser?.id ?? null);
      })
      .finally(() => {
        if (mounted) {
          setLoadingUser(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = Boolean(file && name.trim() && docType && currentUserId);

  const onSubmit = async () => {
    if (!canSubmit || !file || !docType || !currentUserId) {
      if (!currentUserId && !loadingUser) {
        setError("Create at least one active user before uploading documents.");
      }
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const uploadedFile = await uploadDocumentFile(file);

      const payload: CreateDocumentPayload = {
        name: name.trim(),
        fileUrl: uploadedFile.fileUrl,
        fileSizeBytes: uploadedFile.fileSizeBytes,
        mimeType: uploadedFile.mimeType,
        docType,
        uploadedBy: currentUserId,
        linkedAssetId: linkedAssetId ? Number(linkedAssetId) : null,
        expiryDate: expiryDate || null,
        status,
      };

      await createDocument(payload);
      navigate(linkedAssetId ? `/assets/${linkedAssetId}` : "/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[760px]">
      <p className="text-lg">
        Home › <Link to="/documents" className="hover:underline">Documents</Link> ›{" "}
        <strong className="text-[#001970]">Upload Document</strong>
      </p>
      <h1 className="mt-2 mb-7 text-lg">Upload New Document</h1>

      <div className="rounded border border-[#c7c4d8] bg-white p-8">
        <label className="mb-2 block text-sm font-bold uppercase text-[#606475]">
          Document Attachment
        </label>
        <label
          htmlFor="file-input"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-[#c7c4d8] py-12 text-center"
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <UploadCloud className="h-8 w-8 text-[#001970]" />
          <p className="font-bold">{file ? file.name : "Drag and drop a file here"}</p>
          <p className="text-sm text-[#606475]">
            {file ? `${(file.size / 1024).toFixed(0)} KB` : "Supports PDF, DOCX, JPG (Max 25MB)"}
          </p>
        </label>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Document Name
            <input
              className="h-11 rounded border border-[#c7c4d8] px-3"
              placeholder="e.g. FY24 Liability Policy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Document Type
            <select
              className="h-11 rounded border border-[#c7c4d8] px-3"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
            >
              <option value="">Select Category</option>
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Linked Asset (optional)
            <select
              className="h-11 rounded border border-[#c7c4d8] px-3 disabled:bg-[#f3f1f8] disabled:text-[#8b9ab1]"
              value={linkedAssetId}
              onChange={(e) => setLinkedAssetId(e.target.value)}
              disabled={searchParams.has("assetId")}
              title={searchParams.has("assetId") ? "Asset is pre-filled from the asset page" : ""}
            >
              <option value="">No linked asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetCode} - {asset.name}
                </option>
              ))}
            </select>
            {searchParams.has("assetId") && (
              <p className="text-xs text-[#001970]">Pre-filled from asset page</p>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Expiry Date
            <input
              type="date"
              className="h-11 rounded border border-[#c7c4d8] px-3"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            Status
            <select
              className="h-11 rounded border border-[#c7c4d8] px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as DocStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded bg-rose-50 px-4 py-3 text-sm font-bold text-[#c00000]">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-[#c7c4d8] pt-6">
          <Link to="/documents">
            <button className="rounded border border-[#c7c4d8] px-5 py-3 font-bold">Cancel</button>
          </Link>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting || loadingUser}
            className="inline-flex items-center gap-2 rounded bg-[#001970] px-6 py-3 font-bold text-white disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {submitting ? "Uploading..." : loadingUser ? "Preparing..." : "Upload Document"}
          </button>
        </div>
      </div>
    </section>
  );
}
