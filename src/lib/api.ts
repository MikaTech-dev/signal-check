import {
  ApiResponse,
  ApiErrorResponse,
  Incident,
  IncidentReport,
  Attestation,
  TimelineEvent,
  UserAccount,
  ReportLinkage,
  StateTransitionResult,
  AuditLogEntry,
  IncidentType,
  ReportSourceType,
  AttestationType,
} from '@/types';

// All API requests go through the Next.js proxy rewrite (/api/backend/* -> Express).
// The actual backend URL is kept in the server-side API_URL env var and never reaches the browser.
const API_BASE_URL = '/api/backend';


class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('signalng_auth_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('signalng_auth_token', token);
      } else {
        localStorage.removeItem('signalng_auth_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        const error = new Error(errorData.message || 'API request failed') as Error & {
          statusCode: number;
          errors?: Array<{ field: string; message: string }>;
        };
        error.statusCode = response.status;
        error.errors = errorData.errors;
        throw error;
      }

      return data as ApiResponse<T>;
    } catch (err: unknown) {
      const typedErr = err as { statusCode?: number; message?: string; errors?: Array<{ field: string; message: string }> };
      if (typedErr.statusCode) {
        throw err;
      }
      // Connection or network error
      const netError = new Error(
        'Unable to connect to SignalNG server at ' + API_BASE_URL
      ) as Error & { statusCode: number };
      netError.statusCode = 0;
      throw netError;
    }
  }
}

export const apiClient = new ApiClient();

// 1. Authentication Endpoints
export const authApi = {
  register: async (payload: {
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) => {
    const res = await apiClient.request<{
      token: string;
      user: UserAccount;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res;
  },

  login: async (payload: { email: string; password?: string }) => {
    const res = await apiClient.request<{
      token: string;
      user: UserAccount;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiClient.request<null>('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      apiClient.setToken(null);
    }
  },

  getMe: async () => {
    return apiClient.request<UserAccount>('/api/auth/me');
  },

  updateProfile: async (payload: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    return apiClient.request<UserAccount>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

// 2. Incident Endpoints
export const incidentsApi = {
  getNearby: async (lat: number, lng: number, radiusKm: number = 5) => {
    return apiClient.request<Incident[]>(
      `/api/incidents/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );
  },

  getById: async (id: string) => {
    return apiClient.request<Incident>(`/api/incidents/${id}`);
  },

  getTimeline: async (id: string) => {
    return apiClient.request<TimelineEvent[]>(
      `/api/incidents/${id}/timeline`
    );
  },

  getReports: async (id: string) => {
    return apiClient.request<IncidentReport[]>(
      `/api/incidents/${id}/reports`
    );
  },

  getAttestations: async (id: string) => {
    return apiClient.request<Attestation[]>(
      `/api/incidents/${id}/attestations`
    );
  },

  confirm: async (id: string, notes?: string) => {
    return apiClient.request<{
      incident: Incident;
      transition: StateTransitionResult;
    }>(`/api/incidents/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  resolve: async (id: string, reason?: string) => {
    return apiClient.request<{
      incident: Incident;
      transition: StateTransitionResult;
    }>(`/api/incidents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  recalculate: async (id: string) => {
    return apiClient.request<{
      incident: Incident;
      transition: StateTransitionResult;
    }>(`/api/incidents/${id}/recalculate`, {
      method: 'POST',
    });
  },
};

// 3. Report Endpoints
export const reportsApi = {
  submitReport: async (payload: {
    rawText: string;
    incidentType: IncidentType;
    sourceType: ReportSourceType;
    locationLabel: string;
    latitude: number;
    longitude: number;
    eventTime?: string;
    inputType?: string;
  }) => {
    return apiClient.request<{
      report: IncidentReport;
      incident: Incident;
      linkage: ReportLinkage;
    }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitIncidentReport: async (
    incidentId: string,
    payload: {
      rawText: string;
      incidentType: IncidentType;
      sourceType: ReportSourceType;
      locationLabel: string;
      latitude: number;
      longitude: number;
      eventTime?: string;
    }
  ) => {
    return apiClient.request<{
      report: IncidentReport;
      incident: Incident;
    }>(`/api/incidents/${incidentId}/reports`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getById: async (id: string) => {
    return apiClient.request<IncidentReport>(`/api/reports/${id}`);
  },
};

// 4. Attestation Endpoints
export const attestationsApi = {
  submitAttestation: async (
    incidentId: string,
    payload: {
      action: AttestationType;
      comment: string;
      latitude?: number;
      longitude?: number;
      locationLabel?: string;
    }
  ) => {
    return apiClient.request<{
      attestation: Attestation;
      incident: Incident;
      transition: StateTransitionResult;
    }>(`/api/incidents/${incidentId}/attestations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// 5. Admin & Moderation Endpoints
export const adminApi = {
  getUsers: async () => {
    return apiClient.request<UserAccount[]>('/api/admin/users');
  },

  updateUserRole: async (userId: string, role: string) => {
    return apiClient.request<UserAccount>(
      `/api/admin/users/${userId}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }
    );
  },

  updateUserStatus: async (userId: string, status: string) => {
    return apiClient.request<UserAccount>(
      `/api/admin/users/${userId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  getQuarantinedReports: async () => {
    return apiClient.request<IncidentReport[]>(
      '/api/admin/reports/quarantined'
    );
  },

  approveReport: async (reportId: string) => {
    return apiClient.request<{ report: IncidentReport }>(
      `/api/admin/reports/${reportId}/approve`,
      {
        method: 'POST',
      }
    );
  },

  rejectReport: async (reportId: string, reason?: string) => {
    return apiClient.request<{ report: IncidentReport }>(
      `/api/admin/reports/${reportId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  getAuditLogs: async () => {
    return apiClient.request<AuditLogEntry[]>('/api/admin/audit-logs');
  },

  getSettings: async () => {
    return apiClient.request<{
      defaultTtlMinutes: number;
      clusterRadiusKm: number;
      perimeterRadiusKm: number;
    }>('/api/admin/settings');
  },

  updateSettings: async (payload: {
    defaultTtlMinutes?: number;
    clusterRadiusKm?: number;
    perimeterRadiusKm?: number;
  }) => {
    return apiClient.request<{
      defaultTtlMinutes: number;
      clusterRadiusKm: number;
      perimeterRadiusKm: number;
    }>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
