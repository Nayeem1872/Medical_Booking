"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  LogOut,
  Stethoscope,
  XCircle,
  Filter,
} from "lucide-react";
import Link from "next/link";

// TanStack Query imports
import {
  usePatientAppointments,
  useUpdateAppointmentStatus,
} from "@/lib/api/queries";
import { Patient, Appointment } from "@/lib/api/medical-api";

export default function PatientAppointments() {
  // Local state
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const router = useRouter();

  // TanStack Query hooks
  const {
    data: appointmentsResponse,
    isLoading,
    error: appointmentsError,
  } = usePatientAppointments({
    page: currentPage,
    ...(statusFilter && { status: statusFilter }),
  });

  const updateStatusMutation = useUpdateAppointmentStatus();

  // Extract appointments data and pagination info
  const appointments = appointmentsResponse?.data || [];
  const totalPages = appointmentsResponse?.totalPages || 1;
  const total = appointmentsResponse?.total || 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "PATIENT") {
        router.push("/login");
        return;
      }
      setPatient(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleCancelAppointment = async (appointmentId: string) => {
    setError("");
    try {
      await updateStatusMutation.mutateAsync({
        status: "CANCELLED",
        appointment_id: appointmentId,
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to cancel appointment";

      if (error && typeof error === "object" && "response" in error) {
        const response = (
          error as { response?: { data?: { message?: string } } }
        ).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">HealthCare Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/patient/dashboard">
                  <Calendar className="h-4 w-4 mr-2" />
                  Find Doctors
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={patient.photo_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    <Stethoscope className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{patient.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Appointments</h2>
          <p className="text-muted-foreground">
            View and manage your scheduled appointments
          </p>
        </div>

        {/* Filters and Stats */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by status:</span>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value === "all" ? "" : value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All appointments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All appointments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading..."
                : `${total} appointment${total !== 1 ? "s" : ""} total`}
            </div>
          </div>
        </div>

        {(error || appointmentsError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error ||
                (appointmentsError &&
                typeof appointmentsError === "object" &&
                "message" in appointmentsError
                  ? (appointmentsError as { message: string }).message
                  : "Failed to load appointments")}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} appointments found`
                  : "No appointments found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter
                  ? `You don't have any ${statusFilter.toLowerCase()} appointments${
                      statusFilter === "PENDING" ? " yet" : ""
                    }`
                  : "You don't have any appointments scheduled yet"}
              </p>
              {!statusFilter && (
                <Button asChild>
                  <Link href="/patient/dashboard">
                    Book Your First Appointment
                  </Link>
                </Button>
              )}
              {statusFilter && (
                <Button variant="outline" onClick={() => setStatusFilter("")}>
                  Show All Appointments
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            appointment.doctor.photo_url || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {appointment.doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          Dr. {appointment.doctor.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{appointment.doctor.specialization}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {appointment.status === "PENDING" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel Appointment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your appointment
                                with Dr. {appointment.doctor.name} on{" "}
                                {formatDate(appointment.date)}? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Keep Appointment
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleCancelAppointment(appointment.id)
                                }
                                disabled={updateStatusMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {updateStatusMutation.isPending
                                  ? "Cancelling..."
                                  : "Cancel Appointment"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && appointments.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
