import axios from "axios";

const API_BASE_URL = "https://appointment-manager-node.onrender.com/api/v1";

// Types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  photo_url?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
  specialization?: string;
}

export interface DoctorsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Doctor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SpecializationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: string[];
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: Patient;
    token: string;
  };
}

export interface AppointmentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: Record<string, unknown>;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    photo_url?: string;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    photo_url?: string;
  };
}

export interface AppointmentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Appointment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorAppointmentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Appointment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateAppointmentStatusData {
  status: "COMPLETED" | "CANCELLED";
  appointment_id: string;
}

export interface AppointmentBookingData {
  doctorId: string;
  date: string;
}

export const medicalApi = {
  login: async (
    email: string,
    password: string,
    role: "PATIENT" | "DOCTOR"
  ): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      role,
    });
    return response.data;
  },

  getSpecializations: async (): Promise<string[]> => {
    const response = await axios.get<SpecializationsResponse>(
      `${API_BASE_URL}/specializations`
    );
    return response.data.data;
  },

  getDoctors: async (
    params: {
      page?: number;
      limit?: number;
      specialization?: string;
    } = {}
  ): Promise<DoctorsResponse> => {
    const searchParams = {
      page: params.page?.toString() || "1",
      limit: params.limit?.toString() || "6",
      ...(params.specialization &&
        params.specialization !== "all" && {
          specialization: params.specialization,
        }),
    };

    const response = await axios.get<DoctorsResponse>(
      `${API_BASE_URL}/doctors`,
      {
        params: searchParams,
      }
    );
    return response.data;
  },

  getAllDoctors: async (
    params: {
      specialization?: string;
    } = {}
  ): Promise<Doctor[]> => {
    const searchParams = {
      limit: "1000",
      ...(params.specialization &&
        params.specialization !== "all" && {
          specialization: params.specialization,
        }),
    };

    const response = await axios.get<DoctorsResponse>(
      `${API_BASE_URL}/doctors`,
      {
        params: searchParams,
      }
    );
    return response.data.data;
  },

  // Appointments
  bookAppointment: async (
    appointmentData: AppointmentBookingData
  ): Promise<AppointmentResponse> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/appointments`,
      appointmentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getPatientAppointments: async (
    params: {
      status?: string;
      page?: number;
    } = {}
  ): Promise<AppointmentsResponse> => {
    const token = localStorage.getItem("token");
    const searchParams = {
      ...(params.status && { status: params.status }),
      ...(params.page && { page: params.page.toString() }),
    };

    const response = await axios.get<AppointmentsResponse>(
      `${API_BASE_URL}/appointments/patient`,
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getDoctorAppointments: async (
    params: {
      status?: string;
      date?: string;
      page?: number;
    } = {}
  ): Promise<DoctorAppointmentsResponse> => {
    const token = localStorage.getItem("token");
    const searchParams = {
      ...(params.status &&
        params.status !== "all" && { status: params.status }),
      ...(params.date && { date: params.date }),
      ...(params.page && { page: params.page.toString() }),
    };

    const response = await axios.get<DoctorAppointmentsResponse>(
      `${API_BASE_URL}/appointments/doctor`,
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  updateAppointmentStatus: async (
    updateData: UpdateAppointmentStatusData
  ): Promise<AppointmentResponse> => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_BASE_URL}/appointments/update-status`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
