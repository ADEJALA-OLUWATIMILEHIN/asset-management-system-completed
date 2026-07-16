import { Building2, Eye, KeyRound, Save, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDepartments, type ApiDepartment, type ApiUser } from "@/api/Getusers";
import { createUser } from "@/api/Postusers";
import { createStaff } from "@/api/StaffApi";
import { EyeOff } from 'lucide-react';
import { getCurrentUser } from "@/api/LoginApi/LoginApi";

const inputClass =
  "h-12 w-full rounded border border-[#c7c4d8] bg-white px-5 text-base text-[#11111a] outline-none placeholder:text-[#737789] focus:ring-2 focus:ring-[#001970]";

const roleOptions: Array<{ value: ApiUser["role"]; label: string }> = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "VIEWER", label: "Viewer" },
];

const initialsFromName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const generatePassword = () => `ALMS-${Math.random().toString(36).slice(2, 8).toUpperCase()}#${Math.floor(10 + Math.random() * 89)}`;

type RecordType = "USER" | "STAFF_VENDOR";

export default function NewUser() {
  const navigate = useNavigate();
  const isSuperAdmin = getCurrentUser()?.role === "SUPER_ADMIN";
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [recordType, setRecordType] = useState<RecordType>(isSuperAdmin ? "USER" : "STAFF_VENDOR");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState<ApiUser["role"]>("ADMIN");
  const [temporaryPassword, setTemporaryPassword] = useState(generatePassword);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    let mounted = true;

    getDepartments().then((result) => {
      if (mounted) {
        setDepartments(result.data?.departments ?? []);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const branch = useMemo(() => {
    const department = departments.find((item) => String(item.id) === departmentId);
    return department?.branch_location ?? department?.branchLocation ?? "Select a department first";
  }, [departmentId, departments]);

  const canSubmit = Boolean(name.trim() && email.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (recordType === "USER" && !isSuperAdmin) {
      setError("Only a super admin can create a system user and generate a temporary password.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = recordType === "STAFF_VENDOR"
      ? await createStaff({
          fullName: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
        })
      : await createUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          initials: initialsFromName(name) || "U",
          role,
          department_id: departmentId ? Number(departmentId) : null,
          status: "ACTIVE",
          security_clearance: employeeId.trim() || null,
          two_fa_enabled: false,
          password: temporaryPassword,
        });

    setSubmitting(false);

    if (!result.data) {
      setError(result.message);
      return;
    }

    navigate("/users");
  };

  return (
    <section className="mx-auto max-w-[1240px] pb-28">
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-3 text-sm font-medium text-[#606475]">
          <Link to="/users">Users</Link>
          <span>&gt;</span>
          <strong className="text-[#001970]">Add User</strong>
        </div>
        <h1 className="text-4xl font-extrabold tracking-normal text-[#11111a]">
          {recordType === "STAFF_VENDOR" ? "Create Staff / Vendor" : "Create New User"}
        </h1>
        <p className="mt-3 text-xl text-[#30313d]">
          {recordType === "STAFF_VENDOR"
            ? "Add a staff or vendor record that can be assigned to assets and maintenance."
            : "Provision a user account and assign access permissions."}
        </p>
      </div>

      {error && <p className="mb-5 rounded border border-[#f4b4b4] bg-[#fff5f5] px-5 py-4 font-bold text-[#9a1111]">{error}</p>}

      <div className="grid gap-5 xl:grid-cols-[1fr_385px]">
        <div className="space-y-5">
          <article className="rounded-lg border border-[#c7c4d8] bg-white p-8">
            <h2 className="mb-6 flex items-center gap-3 border-b border-[#e6e3ee] pb-5 text-2xl font-bold">
              <UserRoundPlus className="h-6 w-6 text-[#001970]" />
              Account Details
            </h2>
            <div className="grid gap-7 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Record Type
                <select
                  className={inputClass}
                  value={recordType}
                  onChange={(event) => setRecordType(event.target.value as RecordType)}
                >
                  {isSuperAdmin && <option value="USER">System User</option>}
                  <option value="STAFF_VENDOR">Staff / Vendor</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                {recordType === "STAFF_VENDOR" ? "Staff / Vendor Name" : "Full Name"}
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jonathan Smith" />
              </label>
              {recordType === "USER" ? (
                <label className="grid gap-2 text-sm font-semibold">
                  Employee ID
                  <input className={inputClass} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="ALMS-9923" />
                </label>
              ) : (
                <label className="grid gap-2 text-sm font-semibold">
                  Phone Number
                  <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 08012345678" />
                </label>
              )}
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Email Address
                <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="j.smith@enterprise.com" type="email" />
              </label>
            </div>
          </article>

          {recordType === "USER" && isSuperAdmin && (
          <article className="rounded-lg border border-[#c7c4d8] bg-white p-8">
            <h2 className="mb-6 flex items-center gap-3 border-b border-[#e6e3ee] pb-5 text-2xl font-bold">
              <Building2 className="h-6 w-6 text-[#001970]" />
              Organizational Info
            </h2>
            <div className="grid gap-7 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Department
                <select className={inputClass} value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Branch
                <input className={`${inputClass} bg-[#f7f6fd]`} readOnly value={branch} />
              </label>
            </div>
          </article>
          )}

          {recordType === "USER" && isSuperAdmin && (
          <article className="rounded-lg border border-[#c7c4d8] bg-white p-8">
            <h2 className="mb-6 flex items-center gap-3 border-b border-[#e6e3ee] pb-5 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-[#001970]" />
              Security & Access
            </h2>
            <p className="mb-4 text-sm font-semibold">Assign System Role</p>
            <div className="grid gap-4 md:grid-cols-4">
              {roleOptions.map((option) => (
                <button
                  className={`h-12 rounded border px-4 font-bold text-[#001970] ${role === option.value ? "border-[#001970] bg-[#f2f5ff]" : "border-[#c7c4d8] bg-white"}`}
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          
            {/* <label className="mt-7 grid gap-2 text-sm font-semibold">
              Temporary Password
              <span className="flex gap-3">
                <span className="relative flex-1">
                  <input className={`${inputClass} pr-12`} readOnly type="password" value={temporaryPassword} />
                  <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#606475]" />
                </span>
                <button className="inline-flex h-12 items-center gap-2 rounded border border-[#c7c4d8] px-5 font-bold text-[#001970]" onClick={() => setTemporaryPassword(generatePassword())} type="button">
                  <KeyRound className="h-4 w-4" />
                  Generate
                </button>
              </span>
            </label> */}
    <label className="mt-7 grid gap-2 text-sm font-semibold">
     Temporary Password
  <span className="flex gap-3">
    <span className="relative flex-1">
      <input
        className={`${inputClass} pr-12`}
        readOnly
        type={showPassword ? 'text' : 'password'}
        value={temporaryPassword}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#606475]"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </span>
    <button
      className="inline-flex h-12 items-center gap-2 rounded border border-[#c7c4d8] px-5 font-bold text-[#001970]"
      onClick={() => setTemporaryPassword(generatePassword())}
      type="button"
    >
      <KeyRound className="h-4 w-4" />
      Generate
    </button>
  </span>
</label>
  </article>
  )}
</div>

        <aside className="space-y-5">
          <article className="rounded-lg border border-[#c7c4d8] bg-[#f7f6fd] p-8">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.18em]">
              {recordType === "STAFF_VENDOR" ? "Staff / Vendor Preview" : "Permissions Preview"}
            </h2>
            <p className="text-sm leading-6 text-[#30313d]">
              {recordType === "STAFF_VENDOR"
                ? "This record will be available in vendor and staff dropdowns for asset assignment and maintenance scheduling."
                : "The selected role controls asset access, document control, reporting, and system administration permissions."}
            </p>
          </article>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#c7c4d8] bg-white px-5 py-5 shadow-[0_-8px_24px_rgba(17,17,26,0.08)] md:left-[290px] sm:px-8">
        <div className="mx-auto flex max-w-[1240px] items-center justify-end gap-4">
          <Link className="rounded border border-[#c7c4d8] px-8 py-3 font-bold text-[#202333]" to="/users">
            Cancel
          </Link>
          <button className="inline-flex items-center gap-3 rounded bg-[#001970] px-8 py-3 font-bold text-white disabled:opacity-60" disabled={!canSubmit || submitting} onClick={handleSubmit} type="button">
            <Save className="h-4 w-4" />
            {submitting ? "Creating..." : recordType === "STAFF_VENDOR" ? "Create Staff / Vendor" : "Create User Account"}
          </button>
        </div>
      </div>
    </section>
  );
}
