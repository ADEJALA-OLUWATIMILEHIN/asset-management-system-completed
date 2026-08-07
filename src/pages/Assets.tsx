import {
  AlertCircle,
  ArrowUpRight,
  BadgeInfo,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Download,
  Edit3,
  Eye,
  FileText,
  History,
  Info,
  Map as MapIcon,
  MapPinned,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  Search,
  Upload,
  UserSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Getasset } from "@/api/AssetApi/Getasset";
import type { AssetApiAsset, AssetCategory, AssetStatus } from "@/api/AssetApi/Getasset";
import { getDocumentsForAsset, type DocumentRecord } from "@/api/DocumentApi/Document";
import { getMaintenanceRecords, type MaintenanceRecord } from "@/api/MaintenanceApi/MaintenanceApi";

type RegistryCategoryTone = "vehicle" | "hardware" | "property" | "furniture" | "equipment";
type RegistryStatusTone = "active" | "maintenance" | "expired";

type RegistryRow = {
  id: string;
  assetCode: string;
  assetName: string;
  categoryLabel: string;
  categoryTone: RegistryCategoryTone;
  department: string;
  location: string;
  statusLabel: string;
  statusTone: RegistryStatusTone;
  purchaseDate: string;
};

const demoAssets: AssetApiAsset[] = [
  {
    id: 2023001,
    assetCode: "VHC-2023-001",
    name: "Mercedes-Benz Sprinter",
    category: "VEHICLES",
    status: "ACTIVE",
    manufacturer: "Mercedes-Benz",
    modelYear: 2023,
    color: "White",
    serialNumber: "MB-Sprinter-9231",
    purchaseDate: "2023-01-12",
    purchasePrice: 58200,
    warrantyExpiry: "2027-01-12",
    location: "HQ - Chicago",
    condition: "GOOD",
    conditionScore: 92,
    valuation: 52100,
    lastScannedAt: "2026-06-18",
    riskLevel: "LOW",
    createdAt: "2023-01-12",
    department: { id: 1, name: "Logistics", branchLocation: "HQ - Chicago" },
    custodian: { id: 4, name: "Nora Lewis", email: "nora.lewis@alms.test" },
    documents: [{ id: 1, name: "Insurance Certificate", status: "VERIFIED", isVerified: true }],
  },
  {
    id: 8821,
    assetCode: "IT-LAP-8821",
    name: 'MacBook Pro 16" M2',
    category: "IT_INFRASTRUCTURE",
    status: "EXPIRING_SOON",
    manufacturer: "Apple",
    modelYear: 2023,
    color: "Space Gray",
    serialNumber: "C02X8821M2",
    purchaseDate: "2023-05-05",
    purchasePrice: 3499,
    warrantyExpiry: "2026-07-05",
    location: "Remote - Denver",
    condition: "EXCELLENT",
    conditionScore: 88,
    valuation: 2100,
    lastScannedAt: "2026-06-23",
    riskLevel: "MEDIUM",
    createdAt: "2023-05-05",
    department: { id: 2, name: "IT", branchLocation: "Remote - Denver" },
    custodian: { id: 8, name: "Maya Carter", email: "maya.carter@alms.test" },
    documents: [{ id: 2, name: "Warranty", status: "EXPIRING_SOON", isVerified: true }],
  },
  {
    id: 102,
    assetCode: "PROP-NYC-102",
    name: "Midtown Executive Office",
    category: "REAL_ESTATE",
    status: "ACTIVE",
    manufacturer: "ALMS Property",
    modelYear: 2018,
    color: "N/A",
    serialNumber: "NYC-FLR-18-102",
    purchaseDate: "2018-03-22",
    purchasePrice: 8200000,
    warrantyExpiry: null,
    location: "New York City",
    condition: "GOOD",
    conditionScore: 81,
    valuation: 10400000,
    lastScannedAt: "2026-05-30",
    riskLevel: "LOW",
    createdAt: "2018-03-22",
    department: { id: 3, name: "Executive", branchLocation: "New York City" },
    custodian: { id: 12, name: "Alex Thompson", email: "alex.thompson@alms.test" },
    documents: [{ id: 3, name: "Deed", status: "VERIFIED", isVerified: true }],
  },
  {
    id: 42,
    assetCode: "IT-SRV-0042",
    name: "Dell PowerEdge R750",
    category: "IT_INFRASTRUCTURE",
    status: "EXPIRED",
    manufacturer: "Dell",
    modelYear: 2020,
    color: "Black",
    serialNumber: "SRV-R750-0042",
    purchaseDate: "2020-12-15",
    purchasePrice: 12450,
    warrantyExpiry: "2024-12-15",
    location: "Data Center A",
    condition: "FAIR",
    conditionScore: 64,
    valuation: 5100,
    lastScannedAt: "2026-06-05",
    riskLevel: "HIGH",
    createdAt: "2020-12-15",
    department: { id: 4, name: "IT Operations", branchLocation: "Data Center A" },
    custodian: { id: 2, name: "Jordan Kim", email: "jordan.kim@alms.test" },
    documents: [{ id: 4, name: "Warranty", status: "EXPIRED", isVerified: false }],
  },
  {
    id: 921,
    assetCode: "OFF-CH-921",
    name: "Ergonomic Desk Cluster",
    category: "EQUIPMENT",
    status: "ACTIVE",
    manufacturer: "Herman Miller",
    modelYear: 2022,
    color: "Oak / White",
    serialNumber: "FURN-HQ-0921",
    purchaseDate: "2022-08-30",
    purchasePrice: 8400,
    warrantyExpiry: "2028-08-30",
    location: "HQ - Chicago",
    condition: "EXCELLENT",
    conditionScore: 96,
    valuation: 6900,
    lastScannedAt: "2026-06-12",
    riskLevel: "LOW",
    createdAt: "2022-08-30",
    department: { id: 5, name: "HR", branchLocation: "HQ - Chicago" },
    custodian: { id: 9, name: "Paula Stein", email: "paula.stein@alms.test" },
    documents: [{ id: 5, name: "Purchase Receipt", status: "VERIFIED", isVerified: true }],
  },
];

const categoryLabels: Record<AssetCategory, string> = {
  VEHICLES: "Vehicles",
  EQUIPMENT: "Equipment",
  REAL_ESTATE: "Real Estate",
  IT_INFRASTRUCTURE: "IT Infrastructure",
  HEAVY_MACHINERY: "Heavy Machinery",
  CORPORATE_FLEET: "Corporate Fleet",
};

const statusClasses: Record<AssetStatus, string> = {
  ACTIVE: "bg-[#bff1d3] text-[#08613a]",
  EXPIRED: "bg-[#ffe0e0] text-[#9a1111]",
  EXPIRING_SOON: "bg-[#fff0c7] text-[#8a5a00]",
  DECOMMISSIONED: "bg-[#e5e7eb] text-[#374151]",
  PENDING_APPROVAL: "bg-[#dbeafe] text-[#1d4ed8]",
};

const categoryPillClasses: Record<RegistryCategoryTone, string> = {
  vehicle: "bg-[#dbeafe] text-[#003bc7]",
  hardware: "bg-[#efd8ff] text-[#6b00ca]",
  property: "bg-[#bff2d8] text-[#047248]",
  furniture: "bg-[#eceff3] text-[#253044]",
  equipment: "bg-[#e8edf8] text-[#263f91]",
};

const registryStatusPillClasses: Record<RegistryStatusTone, string> = {
  active: "bg-[#c9f5df] text-[#09613f]",
  maintenance: "bg-[#ffecd5] text-[#a2290f]",
  expired: "bg-[#ffe1e1] text-[#a40f0f]",
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not recorded";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMoney = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") return "Not recorded";
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Not recorded";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

const escapeReportValue = (value: unknown) =>
  String(value ?? "Not available").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);

const printPdfTableReport = (title: string, asset: AssetApiAsset, headers: string[], rows: Array<Array<unknown>>) => {
  // Keep a writable window reference so the report HTML can be rendered before printing.
  // `noopener` opens a blank tab but returns null in Chromium, which prevented this report from loading.
  const report = window.open("", "_blank");
  if (!report) return;

  const headerMarkup = headers.map((header) => `<th>${escapeReportValue(header)}</th>`).join("");
  const rowMarkup = rows.map((row) => `<tr>${row.map((value) => `<td>${escapeReportValue(value)}</td>`).join("")}</tr>`).join("");
  report.document.write(`<!doctype html><html><head><title>${escapeReportValue(title)}</title><style>
    @page{size:A4 landscape;margin:14mm}*{box-sizing:border-box}body{color:#11111a;font-family:Arial,sans-serif;margin:0}header{border-bottom:3px solid #001970;margin-bottom:20px;padding-bottom:16px}.eyebrow{color:#606475;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase}h1{color:#001970;font-size:28px;margin:6px 0}.subtitle{color:#30313d;font-size:13px;margin:0}table{border-collapse:collapse;font-size:11px;width:100%}th{background:#f0eef7;color:#30313d;font-size:10px;text-transform:uppercase}th,td{border:1px solid #c7c4d8;padding:8px;text-align:left;vertical-align:top}tr:nth-child(even) td{background:#faf9fd}footer{color:#606475;display:flex;font-size:10px;justify-content:space-between;margin-top:14px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><header><div class="eyebrow">Sterling Assurance Asset Management System</div><h1>${escapeReportValue(title)}</h1><p class="subtitle">Asset: ${escapeReportValue(asset.assetCode)} — ${escapeReportValue(asset.name)}</p></header><table><thead><tr>${headerMarkup}</tr></thead><tbody>${rowMarkup}</tbody></table><footer><span>Generated: ${new Date().toLocaleString()}</span><span>${escapeReportValue(title)}</span></footer><script>window.addEventListener("load",()=>{window.focus();window.print();});</script></body></html>`);
  report.document.close();
};

const formatEnum = (value?: string | null) => {
  if (!value) return "Not recorded";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const valueOrFallback = (value?: string | number | null) =>
  value === undefined || value === null || value === "" ? "Not recorded" : String(value);

const getDepartmentName = (asset: AssetApiAsset) => asset.department?.name ?? "Unassigned";

const getBranchLocation = (asset: AssetApiAsset) =>
  asset.department?.branch_location ??
  asset.department?.branchLocation ??
  asset.location ??
  "Not recorded";

const getRegistryCategory = (asset: AssetApiAsset): Pick<RegistryRow, "categoryLabel" | "categoryTone"> => {
  if (asset.assetCode.startsWith("OFF-")) {
    return { categoryLabel: "FURNITURE", categoryTone: "furniture" };
  }

  switch (asset.category) {
    case "VEHICLES":
    case "CORPORATE_FLEET":
      return { categoryLabel: "VEHICLE", categoryTone: "vehicle" };
    case "IT_INFRASTRUCTURE":
      return { categoryLabel: "IT HARDWARE", categoryTone: "hardware" };
    case "REAL_ESTATE":
      return { categoryLabel: "PROPERTY", categoryTone: "property" };
    default:
      return { categoryLabel: formatEnum(asset.category).toUpperCase(), categoryTone: "equipment" };
  }
};

const getRegistryStatus = (asset: AssetApiAsset): Pick<RegistryRow, "statusLabel" | "statusTone"> => {
  if (asset.status === "ACTIVE") {
    return { statusLabel: "ACTIVE", statusTone: "active" };
  }

  if (asset.status === "EXPIRED" || asset.status === "DECOMMISSIONED") {
    return { statusLabel: "EXPIRED", statusTone: "expired" };
  }

  return { statusLabel: "MAINTENANCE", statusTone: "maintenance" };
};

const buildRegistryRow = (asset: AssetApiAsset): RegistryRow => ({
  id: String(asset.id),
  assetCode: asset.assetCode,
  assetName: asset.name,
  department: getDepartmentName(asset),
  location: getBranchLocation(asset),
  purchaseDate: formatDate(asset.purchaseDate),
  ...getRegistryCategory(asset),
  ...getRegistryStatus(asset),
});

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
}) {
  return (
    <article className="flex min-h-[108px] items-center gap-5 rounded-lg border border-[#c7c4d8] bg-white px-6 py-5">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded ${iconClassName}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#202333]">{label}</p>
        <strong className="mt-1 block text-3xl font-extrabold leading-none text-[#080a12]">{value}</strong>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="relative min-w-[150px] flex-1 sm:flex-none">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full appearance-none rounded border border-[#c7c4d8] bg-[#fbfaff] px-4 pr-10 text-sm font-medium text-[#11111a] outline-none focus:ring-2 focus:ring-[#001970]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="all">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606475]" />
    </label>
  );
}

export default function Assets() {
  const navigate = useNavigate();
  const { assetId } = useParams<{ assetId?: string }>();
  const [assets, setAssets] = useState<AssetApiAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await Getasset();

        if (!isMounted) return;

        if (!result.data) {
          setAssets([]);
          setError(result.message);
          return;
        }

        setAssets(Array.isArray(result.data.assets) ? result.data.assets : []);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayAssets = assets.length > 0 ? assets : demoAssets;
  const isUsingDemoAssets = assets.length === 0;

  const registryRows = useMemo(() => displayAssets.map(buildRegistryRow), [displayAssets]);

  const classOptions = useMemo(
    () => Array.from(new Set(registryRows.map((row) => row.categoryLabel))),
    [registryRows]
  );
  const departmentOptions = useMemo(
    () => Array.from(new Set(registryRows.map((row) => row.department))),
    [registryRows]
  );
  const branchOptions = useMemo(
    () => Array.from(new Set(registryRows.map((row) => row.location))),
    [registryRows]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(registryRows.map((row) => row.statusLabel))),
    [registryRows]
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return registryRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        [row.assetCode, row.assetName, row.department, row.location]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesSearch &&
        (classFilter === "all" || row.categoryLabel === classFilter) &&
        (departmentFilter === "all" || row.department === departmentFilter) &&
        (branchFilter === "all" || row.location === branchFilter) &&
        (statusFilter === "all" || row.statusLabel === statusFilter)
      );
    });
  }, [branchFilter, classFilter, departmentFilter, registryRows, searchTerm, statusFilter]);

  const selectedAsset = assetId
    ? displayAssets.find((asset) => String(asset.id) === assetId)
    : undefined;

  const totalAssets = assets.length > 0 ? assets.length : 1240;
  const inServiceAssets = assets.length > 0
    ? assets.filter((asset) => asset.status === "ACTIVE").length
    : 1150;
  const maintenanceAssets = assets.length > 0
    ? assets.filter((asset) => asset.status === "EXPIRING_SOON" || asset.status === "PENDING_APPROVAL").length
    : 14;

  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setDepartmentFilter("all");
    setBranchFilter("all");
    setStatusFilter("all");
  };

  if (loading) {
    return <p className="p-8 text-center text-lg text-[#30313d]">Loading assets...</p>;
  }

  if (assetId && !selectedAsset) {
    return (
      <section className="mx-auto max-w-[760px] rounded-lg border border-[#c7c4d8] bg-white p-8 text-center">
        <PackagePlus className="mx-auto h-12 w-12 text-[#001970]" />
        <h1 className="mt-4 text-2xl font-bold text-[#11111a]">Asset not found</h1>
        <p className="mt-3 text-[#606475]">Return to the registry and choose an available asset record.</p>
        <Link
          className="mt-6 inline-flex h-12 items-center rounded bg-[#001970] px-6 font-bold text-white"
          to="/assets"
        >
          Back to Assets
        </Link>
      </section>
    );
  }

  if (assetId && selectedAsset) {
    return (
      <AssetDetailView
        assets={displayAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={(id) => navigate(`/assets/${id}`)}
      />
    );
  }

  const shownStart = filteredRows.length > 0 ? 1 : 0;
  const shownEnd = filteredRows.length;

  return (
    <section className="mx-auto max-w-[1240px] pb-8">
      <div className="mb-9 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-[#0b0c14]">Asset Registry</h1>
          <p className="mt-1 text-lg text-[#30313d]">
            Manage and track organizational assets across all departments.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
         {/* 
         // REMOVED THE ASSET BUTTON
          
          <button className="inline-flex h-11 items-center justify-center gap-3 rounded bg-[#001970] px-6 text-sm font-bold text-white shadow-sm">
            <Download className="h-4 w-4" />
            Export
            <ChevronDown className="h-4 w-4" />
          </button> */}
          {/* <Link
            className="inline-flex h-11 items-center justify-center gap-3 rounded bg-[#001970] px-7 text-sm font-bold text-white shadow-sm"
            to="/assets/new"
          >
            <Plus className="h-5 w-5" />
            Add New Asset
          </Link> */}
          <Link to="/assets/new"
          >
            <button className="inline-flex h-11 items-center justify-center gap-3  px-7 text-sm font-bold shadow-sm rounded-lg bg-blue-900 font-medium text-white hover:bg-blue-800">
              <Plus className="h-5 w-5" />
              Add New Asset
            </button>
            </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard
          icon={Package}
          iconClassName="bg-[#e8edf8] text-[#001970]"
          label="Total Registered Assets"
          value={totalAssets.toLocaleString("en")}
        />
        <StatCard
          icon={CheckCircle2}
          iconClassName="bg-[#d9fbe8] text-[#00883d]"
          label="In Service"
          value={inServiceAssets.toLocaleString("en")}
        />
        <StatCard
          icon={AlertCircle}
          iconClassName="bg-[#ffead1] text-[#d73100]"
          label="Under Maintenance"
          value={maintenanceAssets.toLocaleString("en")}
        />
      </div>

      <div className="mt-10 rounded-lg border border-[#c7c4d8] bg-[#f7f6fd] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1 xl:max-w-[430px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#606475]" />
            <input
              className="h-11 w-full rounded border border-[#c7c4d8] bg-[#fbfaff] pl-12 pr-4 text-sm outline-none placeholder:text-[#686c7d] focus:ring-2 focus:ring-[#001970]"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Asset Name, Code or Serial..."
              type="search"
              value={searchTerm}
            />
          </label>

          <div className="flex flex-1 flex-wrap gap-3">
            <FilterSelect label="Asset Class" onChange={setClassFilter} options={classOptions} value={classFilter} />
            <FilterSelect
              label="Department"
              onChange={setDepartmentFilter}
              options={departmentOptions}
              value={departmentFilter}
            />
            <FilterSelect label="Branch" onChange={setBranchFilter} options={branchOptions} value={branchFilter} />
            <FilterSelect label="Status" onChange={setStatusFilter} options={statusOptions} value={statusFilter} />
            <button
              className="h-11 rounded bg-[#001970] px-5 text-sm font-bold text-white shadow-sm"
              onClick={clearFilters}
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && isUsingDemoAssets && (
        <div className="mt-5 rounded border border-[#f1d08a] bg-[#fff8e8] px-4 py-3 text-sm text-[#704600]">
          Live asset records could not load, so sample registry records are shown for layout continuity.
        </div>
      )}

      <article className="mt-10 overflow-hidden rounded-lg border border-[#c7c4d8] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-[#f6f5fb] text-sm font-bold uppercase tracking-[0.12em] text-[#202333]">
              <tr>
                <th className="px-8 py-5">Asset Code</th>
                <th className="px-5 py-5">Asset Name</th>
                <th className="px-5 py-5">Category</th>
                <th className="px-5 py-5">Department</th>
                <th className="px-5 py-5">Location</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Purchase Date</th>
                <th className="px-5 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]">
              {filteredRows.map((row) => (
                <tr
                  className="cursor-pointer transition hover:bg-[#f8faff] focus:bg-[#f8faff] focus:outline-none"
                  key={row.id}
                  onClick={() => navigate(`/assets/${row.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/assets/${row.id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="w-[120px] px-8 py-6 align-middle font-mono text-sm font-bold leading-6 text-[#001970]">
                    {row.assetCode}
                  </td>
                  <td className="px-5 py-6 align-middle text-lg font-medium leading-7 text-[#11111a]">
                    {row.assetName}
                  </td>
                  <td className="px-5 py-6 align-middle">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${categoryPillClasses[row.categoryTone]}`}
                    >
                      {row.categoryLabel}
                    </span>
                  </td>
                  <td className="px-5 py-6 align-middle text-base text-[#202333]">{row.department}</td>
                  <td className="px-5 py-6 align-middle text-base leading-6 text-[#202333]">{row.location}</td>
                  <td className="px-5 py-6 align-middle">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${registryStatusPillClasses[row.statusTone]}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-6 align-middle text-base leading-6 text-[#202333]">{row.purchaseDate}</td>
                  <td className="px-5 py-6 align-middle">
                    <div className="flex justify-end gap-4 text-[#111827]">
                      <button
                        aria-label={`View ${row.assetName}`}
                        className="grid h-9 w-9 place-items-center rounded text-[#111827] hover:bg-[#eef2ff]"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/assets/${row.id}`);
                        }}
                        type="button"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        aria-label={`Edit ${row.assetName}`}
                        className="grid h-9 w-9 place-items-center rounded text-[#111827] hover:bg-[#eef2ff]"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/assets/${row.id}/edit`);
                        }}
                        type="button"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td className="px-8 py-12 text-center text-base text-[#606475]" colSpan={8}>
                    No assets match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#c7c4d8] bg-[#f7f6fd] px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[#202333]">
            Showing <strong>{shownStart} - {shownEnd}</strong> of <strong>{totalAssets.toLocaleString("en")}</strong>{" "}
            assets
          </p>
          <div className="flex items-center gap-3">
            <button className="grid h-11 w-11 place-items-center rounded border border-[#d7d4e3] text-[#b9b7c4]" type="button">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="h-11 min-w-11 rounded bg-[#001970] px-4 font-bold text-white" type="button">
              1
            </button>
            <button className="h-11 min-w-11 rounded px-4 font-medium text-[#11111a]" type="button">
              2
            </button>
            <button className="h-11 min-w-11 rounded px-4 font-medium text-[#11111a]" type="button">
              3
            </button>
            <span className="px-2 text-[#11111a]">...</span>
            <button className="h-11 min-w-11 rounded px-4 font-medium text-[#11111a]" type="button">
              248
            </button>
            <button className="grid h-11 w-11 place-items-center rounded border border-[#c7c4d8] text-[#606475]" type="button">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <article className="rounded-lg border border-[#aec0dc] bg-[#eef4fb] px-8 py-7">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-[#001970]">
            <Info className="h-5 w-5" />
            Registry Health Overview
          </h2>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-[#30313d]">
            You have 8 high-value assets requiring immediate compliance review within the next 30 days.
            Action is recommended to maintain insurance validity.
          </p>
          <Link className="mt-6 inline-flex items-center gap-2 font-bold text-[#001970]" to="/reports">
            View Compliance Report
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="rounded-lg border border-[#c7c4d8] bg-white px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#11111a]">Asset Location Distribution</h2>
            <MapIcon className="h-6 w-6 text-[#606475]" />
          </div>
          <div className="mt-7 flex h-3 overflow-hidden rounded-full">
            <span className="w-[45%] bg-[#001970]" />
            <span className="w-[25%] bg-[#4b5b72]" />
            <span className="w-[30%] bg-[#762000]" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-base">
            <span className="inline-flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#001970]" />
              Chicago (45%)
            </span>
            <span className="inline-flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#4b5b72]" />
              New York (25%)
            </span>
            <span className="inline-flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#762000]" />
              Others (30%)
            </span>
          </div>
        </article>
      </div>

      <footer className="mt-10 flex flex-col gap-4 border-t border-[#c7c4d8] py-7 text-sm tracking-[0.14em] text-[#11111a] lg:flex-row lg:items-center lg:justify-between">
        <span className="tracking-normal">© 2024 ALMS Enterprise | Asset Intelligence Division</span>
        <div className="flex flex-wrap gap-8 uppercase">
          <Link to="/documents">Privacy Policy</Link>
          <Link to="/reports">Compliance</Link>
          <Link to="/users">Support Center</Link>
        </div>
      </footer>
    </section>
  );
}

function AssetDetailView({
  assets,
  onSelectAsset,
  selectedAsset,
}: {
  assets: AssetApiAsset[];
  onSelectAsset: (id: string) => void;
  selectedAsset: AssetApiAsset;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "maintenance" | "audit">("overview");
  const [linkedDocuments, setLinkedDocuments] = useState<DocumentRecord[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const branchLocation = getBranchLocation(selectedAsset);
  const departmentName = getDepartmentName(selectedAsset);
  const conditionScore = Math.max(0, Math.min(100, selectedAsset.conditionScore ?? 0));
  const statusClass = statusClasses[selectedAsset.status] ?? "bg-[#e5e7eb] text-[#374151]";
  const category = categoryLabels[selectedAsset.category] ?? formatEnum(selectedAsset.category);
  const documentCount = documentsLoaded ? linkedDocuments.length : null;

  useEffect(() => {
    let mounted = true;

    queueMicrotask(() => {
      if (!mounted) return;
      setDocumentsLoading(true);
      setDocumentsLoaded(false);

      getDocumentsForAsset(selectedAsset.id)
        .then((docs) => {
          if (mounted) {
            setLinkedDocuments(docs);
          }
        })
        .catch((error) => console.error("Failed to load linked documents", error))
        .finally(() => {
          if (mounted) {
            setDocumentsLoading(false);
            setDocumentsLoaded(true);
          }
        });
    });

    return () => {
      mounted = false;
    };
  }, [selectedAsset.id]);

  useEffect(() => {
    if (activeTab !== "maintenance") return;

    let mounted = true;

    queueMicrotask(() => {
      if (!mounted) return;
      setMaintenanceLoading(true);

      getMaintenanceRecords()
        .then((result) => {
          if (mounted) {
            setMaintenanceRecords(
              result.data?.maintenanceRecords.filter((record) => record.assetId === selectedAsset.id) ?? []
            );
          }
        })
        .catch((error) => console.error("Failed to load maintenance records", error))
        .finally(() => {
          if (mounted) setMaintenanceLoading(false);
        });
    });

    return () => {
      mounted = false;
    };
  }, [activeTab, selectedAsset.id]);

  const infoGroups = [
    {
      title: "General Info",
      icon: BadgeInfo,
      rows: [
        ["Manufacturer", valueOrFallback(selectedAsset.manufacturer)],
        ["Model Year", valueOrFallback(selectedAsset.modelYear)],
        ["Category", category],
        ["Color", valueOrFallback(selectedAsset.color)],
      ],
    },
    {
      title: "Purchase Info",
      icon: CreditCard,
      rows: [
        ["Purchase Date", formatDate(selectedAsset.purchaseDate)],
        ["Purchase Price", formatMoney(selectedAsset.purchasePrice)],
        ["Warranty Expiry", formatDate(selectedAsset.warrantyExpiry)],
        ["Valuation", formatMoney(selectedAsset.valuation)],
      ],
    },
    {
      title: "Assigned Info",
      icon: UserSquare,
      rows: [
        ["Custodian", selectedAsset.custodian?.name ?? "Unassigned"],
        ["Location", valueOrFallback(branchLocation)],
        ["Condition", formatEnum(selectedAsset.condition)],
        ["Department", departmentName],
      ],
    },
  ];

  const sideStats = [
    ["Serial Number", valueOrFallback(selectedAsset.serialNumber)],
    ["Last Scanned", formatDate(selectedAsset.lastScannedAt)],
    ["Created Date", formatDate(selectedAsset.createdAt)],
  ];

  return (
    <section className="mx-auto max-w-[1240px]">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-8 flex flex-wrap items-center gap-3 text-base text-[#33415c]">
            <Link to="/">Home</Link>
            <span>&gt;</span>
            <Link to="/assets">Assets</Link>
            <span>&gt;</span>
            <strong className="text-[#001970]">{selectedAsset.assetCode}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-extrabold text-[#11111a]">{selectedAsset.name}</h1>
            <span className={`rounded-full px-4 py-2 text-sm font-bold tracking-[0.12em] ${statusClass}`}>
              {formatEnum(selectedAsset.status)}
            </span>
          </div>
          <p className="mt-2 text-lg text-[#30313d]">
            Asset ID: <strong className="font-mono text-[#001970]">{selectedAsset.assetCode}</strong> |{" "}
            {departmentName}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {assets.length > 1 && (
            <label className="relative">
              <span className="sr-only">Select asset</span>
              <select
                className="h-14 min-w-64 appearance-none rounded border border-[#c7c4d8] bg-white px-4 pr-10 text-base"
                onChange={(event) => onSelectAsset(event.target.value)}
                value={String(selectedAsset.id)}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetCode} - {asset.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#606475]" />
            </label>
          )}
          <Link
            className="inline-flex h-14 items-center gap-3 rounded bg-[#001970] px-6 text-lg font-semibold text-white shadow-sm"
            to={`/assets/${selectedAsset.id}/edit`}
          >
            <Edit3 className="h-5 w-5" />
            Edit Asset
          </Link>
          <Link
            className="inline-flex h-14 items-center rounded bg-[#001970] px-7 text-lg font-semibold text-white"
            to="/assets/new"
          >
            New Asset
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_255px]">
        <div>
          <div className="mb-7 flex gap-10 border-b border-[#c7c4d8] text-lg">
            {[
              { id: "overview", label: "Overview" },
              { id: "documents", label: "Documents" },
              { id: "maintenance", label: "Maintenance" },
              { id: "audit", label: "Audit Trail" },
            ].map((tab) => (
              <button
                className={`pb-5 transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#001970] font-bold text-[#001970]"
                    : "text-[#606475] hover:text-[#001970]"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {infoGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <article className="rounded-lg border border-[#c7c4d8] bg-white p-7" key={group.title}>
                      <h2 className="mb-5 flex items-center gap-3 text-lg font-medium text-[#001970]">
                        <Icon className="h-5 w-5" />
                        {group.title}
                      </h2>
                      <div className="divide-y divide-[#e6e3ee]">
                        {group.rows.map(([label, value]) => (
                          <div className="grid grid-cols-2 gap-3 py-3 text-lg" key={label}>
                            <span>{label}</span>
                            <strong className="text-right">{value}</strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-2">
               

                <article className="rounded-lg border border-[#c7c4d8] bg-white p-7">
                  <div className="mb-6 flex items-center justify-between text-lg text-[#001970]">
                    <h2>Asset Map Location</h2>
                    <button className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5" />
                      Full Map
                    </button>
                  </div>
                  <div className="grid h-[285px] place-items-center overflow-hidden bg-[#b7e5e9]">
                    <MapPinned className="h-24 w-24 text-[#1796a4]" />
                  </div>
                </article>
              </div>
            </>
          )}

          {activeTab === "documents" && (
            <article className="rounded-lg border border-[#c7c4d8] bg-white p-7">
              <h2 className="mb-5 text-xl font-bold text-[#001970]">Linked Documents</h2>
              {documentsLoading ? (
                <div className="py-8 text-center text-[#606475]">Loading documents...</div>
              ) : linkedDocuments.length > 0 ? (
                <div className="space-y-3">
                  {linkedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-4 rounded border border-[#c7c4d8] p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#001970]" />
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-sm text-[#606475]">{doc.docType || "Document"}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded px-3 py-1 text-sm font-bold ${
                            doc.isVerified
                              ? "bg-[#d4f4dd] text-[#007042]"
                              : doc.status === "EXPIRING_SOON"
                                ? "bg-[#fff1c5] text-[#913900]"
                                : "bg-[#ffe0e0] text-[#c50000]"
                          }`}
                        >
                          {doc.status || "Active"}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    className="mt-2 inline-flex items-center gap-2 rounded bg-[#001970] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00268f]"
                    onClick={() => {
                      printPdfTableReport("Document Upload Report", selectedAsset, ["Document", "Type", "Status", "Expiry date", "Verified"], linkedDocuments.map((doc) => [
                        doc.name, doc.docType || "Document", doc.status || "Active",
                        doc.expiryDate ? formatDate(doc.expiryDate) : "No expiry date", doc.isVerified ? "Yes" : "No",
                      ]));
                    }}
                    type="button"
                  >
                    <Printer className="h-4 w-4" /> Print Document Uploads PDF
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-[#606475]">No documents linked to this asset</div>
              )}
            </article>
          )}

          {activeTab === "maintenance" && (
            <article className="rounded-lg border border-[#c7c4d8] bg-white p-7">
              <h2 className="mb-5 text-xl font-bold text-[#001970]">Maintenance Records</h2>
              {maintenanceLoading ? (
                <div className="py-8 text-center text-[#606475]">Loading maintenance records...</div>
              ) : maintenanceRecords.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceRecords.map((record) => (
                    <div key={record.id} className="rounded border border-[#c7c4d8] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <strong>{record.maintenanceType}</strong>
                        <span className="rounded bg-[#dce4ff] px-3 py-1 text-sm font-bold text-[#001970]">
                          {record.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#606475]">
                        Next service: {formatDate(record.nextServiceDate)} | Cost: {formatMoney(record.cost)}
                      </p>
                      {record.notes && <p className="mt-2 text-sm text-[#30313d]">{record.notes}</p>}
                    </div>
                  ))}
                  <button
                    className="mt-2 inline-flex items-center gap-2 rounded bg-[#001970] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00268f]"
                    onClick={() => printPdfTableReport("Maintenance History Report", selectedAsset, ["Maintenance type", "Status", "Last service", "Next service", "Cost", "Notes"], maintenanceRecords.map((record) => [
                      record.maintenanceType, record.status, formatDate(record.lastServiceDate), formatDate(record.nextServiceDate), formatMoney(record.cost), record.notes,
                    ]))}
                    type="button"
                  >
                    <Printer className="h-4 w-4" /> Print Maintenance History PDF
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-[#606475]">No maintenance records available for this asset</div>
              )}
            </article>
          )}

          {activeTab === "audit" && (
            <article className="rounded-lg border border-[#c7c4d8] bg-white p-7">
              <h2 className="mb-5 text-xl font-bold text-[#001970]">Audit Trail</h2>
              <div className="py-8 text-center text-[#606475]">No audit records available for this asset</div>
            </article>
          )}
        </div>

        <aside className="space-y-5">
          <article className="rounded-lg border border-[#c7c4d8] bg-white p-6 text-center">
            <h2 className="mb-7 tracking-[0.25em]">ASSET IDENTIFICATION</h2>
            {/* <div className="grid h-44 place-items-center rounded border border-[#c7c4d8] bg-[#17242b]">
              <Camera className="h-16 w-16 text-white" />
            </div> */}
            <div className="mt-6 space-y-4 text-left">
              {sideStats.map(([label, value]) => (
                <div className="bg-[#f1f0f7] p-4" key={label}>
                  <p className="text-lg">{label}</p>
                  <strong className="mt-2 block font-mono">{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-[#c7c4d8] bg-white p-6">
            <h2 className="mb-7 text-center tracking-[0.25em]">CONDITION HEALTH</h2>
            <p className="mb-1 text-right text-[#8a2a12]">{formatEnum(selectedAsset.riskLevel)} risk</p>
            <strong className="text-xl text-[#001970]">{conditionScore}%</strong>
            <div className="my-3 h-2 rounded-full bg-[#d8d9e7]">
              <div className="h-2 rounded-full bg-[#001970]" style={{ width: `${conditionScore}%` }} />
            </div>
            {[
              ["Condition", formatEnum(selectedAsset.condition)],
              ["Documents", documentCount === null ? "Loading..." : `${documentCount} linked`],
              ["Status", formatEnum(selectedAsset.status)],
            ].map(([label, value]) => (
              <div className="flex justify-between py-2 text-lg" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </article>

          <article className="space-y-6 rounded-lg border border-[#c7c4d8] bg-white p-8 text-lg">
            <Link
              to={`/documents/new?assetId=${selectedAsset?.id || ""}`}
              className="flex items-center gap-5 hover:text-[#001970] transition-colors"
            >
              <Upload className="h-5 w-5" />
              Upload Document
            </Link>
            <button
              onClick={() => setActiveTab("documents")}
              className="flex items-center gap-5 hover:text-[#001970] transition-colors"
            >
              <FileText className="h-5 w-5" />
              View Documents
            </button>
            <button className="flex items-center gap-5 hover:text-[#001970] transition-colors">
              <History className="h-5 w-5" />
              View Full History
            </button>
            <button className="flex items-center gap-5 text-[#d00000] hover:text-[#a00000] transition-colors">
              <AlertCircle className="h-5 w-5" />
              Report Issue
            </button>
          </article>
        </aside>
      </div>
    </section>
  );
}
