const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const getSessionId = (): string | null => {
  return localStorage.getItem('sage_session_id');
};

export const setSessionId = (sessionId: string): void => {
  localStorage.setItem('sage_session_id', sessionId);
};

export const clearSession = (): void => {
  localStorage.removeItem('sage_session_id');
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const sessionId = getSessionId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessionId) {
    (headers as Record<string, string>)['X-Session-Id'] = sessionId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (endpoint !== '/api/auth/login') {
      clearSession();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    const message =
      typeof error.detail === 'string'
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map((e: { msg?: string }) => e.msg ?? JSON.stringify(e)).join(', ')
          : error.message ?? `HTTP ${response.status}`;
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export interface AuthResponse {
  session_id: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'therapist';
  date_of_birth?: string;
}

export const authApi = {
  signup: async (
    email: string,
    password: string,
    name: string,
    role: 'client' | 'therapist' = 'client',
    date_of_birth?: string
  ) => {
    const response = await apiFetch<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, date_of_birth: date_of_birth || null }),
    });
    setSessionId(response.session_id);
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSessionId(response.session_id);
    return response;
  },

  me: async () => {
    return apiFetch<User>('/api/auth/me');
  },

  logout: async () => {
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await apiFetch<{ status: string }>('/api/auth/logout', { method: 'POST' });
      } catch {}
    }
    clearSession();
  },
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSendResponse {
  reply: string;
  turn_id: string;
  intake_complete: boolean;
  group_id: string | null;
  group_name: string | null;
  group_focus: string | null;
  match_reason: string | null;
}

export interface ChatTurn {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export const chatApi = {
  send: async (message: string) => {
    return apiFetch<ChatSendResponse>('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  history: async () => {
    return apiFetch<{ turns: ChatTurn[] }>('/api/chat/history');
  },

  complete: async () => {
    return apiFetch<{ status: string; session_id?: string; group_id?: string }>('/api/chat/complete', {
      method: 'POST',
    });
  },

  restart: async () => {
    return apiFetch<{ status: string; message?: string }>('/api/chat/restart', {
      method: 'POST',
    });
  },
};

export interface IntakeResponse {
  primary_concern: string | null;
  contextual_background: string | null;
  emotional_intensity: number | null;
  life_impact_areas: string[] | null;
  support_goals: string | null;
  availability: string | null;
}

export const intakeApi = {
  get: async () => {
    return apiFetch<IntakeResponse>('/api/intake');
  },
};

export interface GroupResponse {
  id: string;
  name: string;
  focus: string;
  match_reason: string | null;
  primary_concern?: string | null;
  life_impact_areas?: string[] | null;
}

export const groupsApi = {
  my: async (): Promise<GroupResponse | null> => {
    try {
      return await apiFetch<GroupResponse>('/api/groups/my');
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      if (err?.status === 404 || (typeof err?.message === 'string' && err.message.toLowerCase().includes('no group'))) return null;
      throw e;
    }
  },

  get: async (groupId: string) => {
    return apiFetch<GroupResponse>(`/api/groups/${groupId}`);
  },
};

export interface SlotResponse {
  id: string;
  slot_at: string;
}

export const schedulingApi = {
  slots: async (): Promise<SlotResponse[]> => {
    try {
      const res = await apiFetch<{ slots: SlotResponse[] }>('/api/scheduling/slots');
      return res.slots ?? [];
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      if (err?.status === 404 || (typeof err?.message === 'string' && err.message.toLowerCase().includes('no group'))) return [];
      throw e;
    }
  },

  confirm: async (slotId: string) => {
    return apiFetch<{ status: string; slot_id: string }>('/api/scheduling/confirm', {
      method: 'POST',
      body: JSON.stringify({ slot_id: slotId }),
    });
  },
};

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export const paymentsApi = {
  create: async () => {
    return apiFetch<Payment>('/api/payments/create', {
      method: 'POST',
    });
  },

  status: async (paymentId: string) => {
    return apiFetch<Payment>(`/api/payments/${paymentId}/status`);
  },

  confirm: async (paymentId: string) => {
    return apiFetch<Payment>(`/api/payments/${paymentId}/confirm`, {
      method: 'POST',
    });
  },
};

export interface ParticipantSummary {
  id: string;
  name: string;
  primary_concern: string;
  emotional_intensity: 'low' | 'moderate' | 'high';
  support_goals: string[];
  match_reason: string;
}

export interface GroupHandoff {
  id: string;
  name: string;
  focus_area: string;
  description: string;
  participant_count: number;
  scheduled_time: string;
  overview: string;
  key_themes: string[];
  participants: ParticipantSummary[];
}

export const handoffApi = {
  groups: async () => {
    return apiFetch<{ groups: GroupHandoff[] }>('/api/handoff/groups');
  },

  group: async (groupId: string) => {
    return apiFetch<GroupHandoff>(`/api/handoff/group/${groupId}`);
  },

  document: async (groupId: string) => {
    return apiFetch<{ document: string }>(`/api/handoff/group/${groupId}/document`);
  },
};
