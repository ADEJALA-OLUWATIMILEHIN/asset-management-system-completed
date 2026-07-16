export type MaintenanceStatus = "SCHEDULED" | "PENDING" | "OVERDUE" | "COMPLETED";

export type MaintenanceRecord = {
  id: number;
  assetId: number;
  maintenanceType: string;
  vendorId?: number | null;
  cost?: number | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  status: MaintenanceStatus;
  notes?: string | null;
  createdBy: number;
  createdAt?: string;
  updatedAt?: string;
  asset?: {
    id: number;
    assetCode: string;
    name: string;
  } | null;
};

export type CreateMaintenancePayload = {
  assetId: number;
  maintenanceType: string;
  vendorId?: number | null;
  cost?: number | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  status?: MaintenanceStatus;
  notes?: string | null;
  createdBy: number;
};

type ApiResult<T> = {
  message?: string;
  data: T | null;
  error?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3005";
const maintenanceUrl = `${apiBaseUrl}/maintenance`;

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export const getMaintenanceRecords = async (): Promise<
  ApiResult<{ maintenanceRecords: MaintenanceRecord[] }>
> => {
  try {
    const res = await fetch(maintenanceUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const message = await readErrorMessage(res, "Failed to fetch maintenance records");
      return { message, data: null };
    }

    const body = await res.json();
    return {
      message: "Maintenance records fetched successfully",
      data: body.maintenanceRecords
        ? { maintenanceRecords: body.maintenanceRecords }
        : body.data,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
      data: null,
    };
  }
};

export const getMaintenanceStats = async (): Promise<
  ApiResult<{
    pending: number;
    scheduled: number;
    completed: number;
    overdue: number;
  }>
> => {
  try {
    const res = await fetch(`${maintenanceUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const message = await readErrorMessage(res, "Failed to fetch maintenance stats");
      return { message, data: null };
    }

    const body = await res.json();
    return {
      message: "Maintenance stats fetched successfully",
      data: body.data || body,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
      data: null,
    };
  }
};

export const getMaintenanceRecord = async (
  id: number
): Promise<ApiResult<{ maintenanceRecord: MaintenanceRecord }>> => {
  try {
    const res = await fetch(`${maintenanceUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const message = await readErrorMessage(res, "Failed to fetch maintenance record");
      return { message, data: null };
    }

    const body = await res.json();
    return {
      message: "Maintenance record fetched successfully",
      data: body.maintenanceRecord ? { maintenanceRecord: body.maintenanceRecord } : body.data,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
      data: null,
    };
  }
};

export const createMaintenanceRecord = async (
  payload: CreateMaintenancePayload
): Promise<ApiResult<{ maintenanceRecord: MaintenanceRecord }>> => {
  try {
    const res = await fetch(`${maintenanceUrl}/new-maintenance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await readErrorMessage(res, "Failed to create maintenance record");
      return { message, data: null };
    }

    const body = await res.json();
    return {
      message: body.message || "Maintenance record created successfully",
      data: body.maintenanceRecord ? { maintenanceRecord: body.maintenanceRecord } : body.data,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
      data: null,
    };
  }
};

export const updateMaintenanceRecord = async (
  id: number,
  payload: Partial<CreateMaintenancePayload>
): Promise<ApiResult<{ maintenanceRecord: MaintenanceRecord }>> => {
  try {
    const res = await fetch(`${maintenanceUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await readErrorMessage(res, "Failed to update maintenance record");
      return { message, data: null };
    }

    const body = await res.json();
    return {
      message: body.message || "Maintenance record updated successfully",
      data: body.maintenanceRecord ? { maintenanceRecord: body.maintenanceRecord } : body.data,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
      data: null,
    };
  }
};
