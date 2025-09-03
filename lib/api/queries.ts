import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  medicalApi,
  Doctor,
  DoctorsResponse,
  Appointment,
  AppointmentsResponse,
  DoctorAppointmentsResponse,
} from "./medical-api";

export const queryKeys = {
  doctors: ["doctors"] as const,
  doctorsList: (params: { page?: number; specialization?: string }) =>
    [...queryKeys.doctors, "list", params] as const,
  allDoctors: (params: { specialization?: string }) =>
    [...queryKeys.doctors, "all", params] as const,
  specializations: ["specializations"] as const,
  appointments: ["appointments"] as const,
  patientAppointments: (params: { status?: string; page?: number }) =>
    [...queryKeys.appointments, "patient", params] as const,
  doctorAppointments: (params: {
    status?: string;
    date?: string;
    page?: number;
  }) => [...queryKeys.appointments, "doctor", params] as const,
};

export const useDoctors = (
  params: {
    page?: number;
    limit?: number;
    specialization?: string;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.doctorsList({
      page: params.page,
      specialization: params.specialization,
    }),
    queryFn: () => medicalApi.getDoctors(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAllDoctors = (
  params: {
    specialization?: string;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.allDoctors(params),
    queryFn: () => medicalApi.getAllDoctors(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
export const useSpecializations = () => {
  return useQuery({
    queryKey: queryKeys.specializations,
    queryFn: medicalApi.getSpecializations,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
      role,
    }: {
      email: string;
      password: string;
      role: "PATIENT" | "DOCTOR";
    }) => medicalApi.login(email, password, role),
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicalApi.bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    },
    onError: (error) => {
      console.error("Error booking appointment:", error);
    },
  });
};

export const usePatientAppointments = (
  params: {
    status?: string;
    page?: number;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.patientAppointments(params),
    queryFn: () => medicalApi.getPatientAppointments(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useDoctorAppointments = (
  params: {
    status?: string;
    date?: string;
    page?: number;
  } = {}
) => {
  return useQuery({
    queryKey: queryKeys.doctorAppointments(params),
    queryFn: () => medicalApi.getDoctorAppointments(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: medicalApi.updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    },
    onError: (error) => {
      console.error("Error updating appointment status:", error);
    },
  });
};
