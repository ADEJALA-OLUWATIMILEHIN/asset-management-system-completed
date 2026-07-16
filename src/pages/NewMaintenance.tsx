import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronDown, Loader2, Save, Settings, Wrench } from "lucide-react";
import { Getasset, type AssetApiAsset } from "@/api/AssetApi/Getasset";
import { getUsers } from "@/api/Getusers";
import { createMaintenanceRecord, getMaintenanceRecord, updateMaintenanceRecord, type MaintenanceStatus } from "@/api/MaintenanceApi/MaintenanceApi";
import { getStaff, type StaffRecord } from "@/api/StaffApi";

const inputClass =
  "h-11 w-full rounded border border-[#c7c4d8] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#001970]/25";

export default function NewMaintenance(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = Number(searchParams.get("recordId"));
  const isEditing = Number.isInteger(recordId) && recordId > 0;
  const [assets, setAssets] = useState<AssetApiAsset[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [assetId, setAssetId] = useState(searchParams.get("assetId") ?? "");
  const [maintenanceType, setMaintenanceType] = useState("Preventive Service");
  const [vendorId, setVendorId] = useState("");
  const [cost, setCost] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("SCHEDULED");
  const [notes, setNotes] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([Getasset(), getStaff(), getUsers()])
      .then(([result, staffResult, userResult]) => {
        if (!mounted) return;
        setAssets(result.data?.assets ?? []);
        setStaff(staffResult.data?.staff ?? []);
        const activeUser =
          userResult.data?.users.find((user) => user.status === "ACTIVE") ??
          userResult.data?.users[0] ??
          null;
        setCurrentUserId(activeUser?.id ?? null);
        const firstAssetId = result.data?.assets?.[0]?.id;
        if (firstAssetId) {
          setAssetId((currentAssetId) => currentAssetId || String(firstAssetId));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingAssets(false);
          setLoadingStaff(false);
          setLoadingUser(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    getMaintenanceRecord(recordId).then((result) => {
      const record = result.data?.maintenanceRecord;
      if (!record) {
        setError(result.message ?? "Failed to load maintenance record");
        return;
      }

      setAssetId(String(record.assetId));
      setMaintenanceType(record.maintenanceType);
      setVendorId(record.vendorId ? String(record.vendorId) : "");
      setCost(record.cost?.toString() ?? "");
      setLastServiceDate(record.lastServiceDate?.slice(0, 10) ?? "");
      setNextServiceDate(record.nextServiceDate?.slice(0, 10) ?? "");
      setStatus(record.status);
      setNotes(record.notes ?? "");
    });
  }, [isEditing, recordId]);

  const selectedAsset = useMemo(
    () => assets.find((asset) => String(asset.id) === assetId),
    [assets, assetId]
  );

  const canSubmit = Boolean(assetId && maintenanceType.trim() && currentUserId);

  const handleSubmit = async () => {
    if (!canSubmit || !currentUserId) {
      if (!currentUserId && !loadingUser) {
        setError("Create at least one active user before scheduling maintenance.");
      }
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      assetId: Number(assetId),
      maintenanceType: maintenanceType.trim(),
      vendorId: vendorId ? Number(vendorId) : null,
      cost: cost ? Number(cost) : null,
      lastServiceDate: lastServiceDate || null,
      nextServiceDate: nextServiceDate || null,
      status,
      notes: notes.trim() || null,
    };
    const result = isEditing
      ? await updateMaintenanceRecord(recordId, payload)
      : await createMaintenanceRecord({ ...payload, createdBy: currentUserId });

    setSubmitting(false);

    if (!result.data) {
      setError(result.message ?? "Failed to schedule maintenance");
      return;
    }

    navigate(`/assets/${assetId}`);
  };

  return (
    <section className="mx-auto max-w-[1180px] pb-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[#606475]">
            <Link to="/maintenance" className="hover:underline">Maintenance</Link> &gt;{" "}
            <strong className="text-[#001970]">{isEditing ? "Update service" : "Schedule service"}</strong>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#11111a]">{isEditing ? "Update Maintenance" : "Schedule Maintenance"}</h1>
          <p className="mt-1 text-[#30313d]">{isEditing ? "Update the selected asset's maintenance record." : "Create a service record linked directly to an asset."}</p>
        </div>
        <Link className="font-bold text-[#001970]" to="/maintenance">
          Back to Maintenance
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-[#c7c4d8] bg-white p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#001970]">
            <Settings className="h-5 w-5" />
            Service Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Select Asset
              <span className="relative">
                <select
                  className={`${inputClass} appearance-none pr-10`}
                  disabled={loadingAssets}
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                >
                  {loadingAssets && <option>Loading assets...</option>}
                  {!loadingAssets && assets.length === 0 && <option value="">No assets available</option>}
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetCode} - {asset.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606475]" />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Maintenance Type
              <input className={inputClass} value={maintenanceType} onChange={(event) => setMaintenanceType(event.target.value)} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Vendor / Staff
              <span className="relative">
                <select
                  className={`${inputClass} appearance-none pr-10`}
                  disabled={loadingStaff}
                  value={vendorId}
                  onChange={(event) => setVendorId(event.target.value)}
                >
                  <option value="">{loadingStaff ? "Loading staff..." : "No vendor selected"}</option>
                  {staff.map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.fullName} - {staffMember.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606475]" />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Cost
              <input className={inputClass} min="0" step="0.01" type="number" value={cost} onChange={(event) => setCost(event.target.value)} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Last Service Date
              <input className={inputClass} type="date" value={lastServiceDate} onChange={(event) => setLastServiceDate(event.target.value)} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Next Service Date
              <input className={inputClass} type="date" value={nextServiceDate} onChange={(event) => setNextServiceDate(event.target.value)} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Status
              <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as MaintenanceStatus)}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold md:col-span-2">
              Notes
              <textarea
                className="min-h-28 w-full resize-none rounded border border-[#c7c4d8] bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#001970]/25"
                placeholder="Instructions, faults, parts needed, or vendor notes..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          {error && <p className="mt-5 rounded bg-rose-50 px-4 py-3 text-sm font-bold text-[#c00000]">{error}</p>}

          <div className="mt-7 flex justify-end gap-3 border-t border-[#c7c4d8] pt-5">
            <Link className="rounded border border-[#c7c4d8] px-5 py-3 font-bold text-[#202333]" to="/maintenance">
              Cancel
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded bg-[#001970] px-6 py-3 font-bold text-white disabled:opacity-50"
              disabled={!canSubmit || submitting || loadingUser}
              onClick={handleSubmit}
              type="button"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : loadingUser ? "Preparing..." : isEditing ? "Save Changes" : "Schedule Maintenance"}
            </button>
          </div>
        </article>

        <aside className="rounded-lg border border-[#c7c4d8] bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#001970]">
            <Wrench className="h-5 w-5" />
            Asset Preview
          </h2>
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="rounded bg-[#f3f1f8] p-4">
                <p className="text-sm text-[#606475]">Asset</p>
                <strong>{selectedAsset.name}</strong>
                <p className="mt-1 font-mono text-sm text-[#001970]">{selectedAsset.assetCode}</p>
              </div>
              <div className="rounded bg-[#f3f1f8] p-4">
                <p className="text-sm text-[#606475]">Department</p>
                <strong>{selectedAsset.department?.name ?? "Unassigned"}</strong>
              </div>
              <div className="rounded bg-[#f3f1f8] p-4">
                <p className="text-sm text-[#606475]">Warranty</p>
                <strong>{selectedAsset.warrantyExpiry ? selectedAsset.warrantyExpiry.slice(0, 10) : "Not recorded"}</strong>
              </div>
              {nextServiceDate && (
                <div className="flex items-center gap-3 rounded bg-[#fff1c5] p-4 text-[#913900]">
                  <CalendarDays className="h-5 w-5" />
                  <strong>Next service: {nextServiceDate}</strong>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#606475]">Choose an asset to preview its details.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
