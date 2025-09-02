"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CalendarIcon, LogOut, Clock, Stethoscope } from "lucide-react";
import Link from "next/link";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  photo_url?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      console.log("Missing token or userData, redirecting to login");
      router.push("/login");
      return;
    }

    // Debug: Log the raw userData to see what's actually stored
    console.log("Raw userData from localStorage:", userData);
    console.log("userData type:", typeof userData);
    console.log("userData length:", userData.length);

    // Check if userData is empty string or whitespace only
    if (userData.trim() === "") {
      console.log("Empty userData detected, clearing storage");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    console.log("userData", userData);
    // try {

    //   const parsedUser = JSON.parse(userData);
    //   console.log("Successfully parsed user:", parsedUser);

    //   if (!parsedUser || typeof parsedUser !== "object") {
    //     throw new Error("Invalid user object");
    //   }

    //   if (parsedUser.role !== "PATIENT") {
    //     console.log("User is not a patient, redirecting to login");
    //     router.push("/login");
    //     return;
    //   }

    //   setPatient(parsedUser);
    //   fetchSpecializations();
    //   fetchDoctors();
    // } catch (error) {
    //   console.error("Error parsing user data:", error);
    //   console.error("Failed to parse userData:", JSON.stringify(userData));
    //   // Clear corrupted data and redirect to login
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("user");
    //   router.push("/login");
    // }
  }, [router, currentPage, searchTerm, selectedSpecialization]);

  const fetchSpecializations = async () => {
    try {
      const response = await fetch(
        "https://appointment-manager-node.onrender.com/api/v1/specializations"
      );
      const data = await response.json();
      setSpecializations(data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "6",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedSpecialization && {
          specialization: selectedSpecialization,
        }),
      });

      const response = await fetch(
        `https://appointment-manager-node.onrender.com/api/v1/doctors?${params}`
      );
      const data = await response.json();

      setDoctors(data.doctors || []);
      setFilteredDoctors(data.doctors || []);
      setTotalPages(Math.ceil((data.total || 0) / 6));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setBookingLoading(true);
    setBookingError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://appointment-manager-node.onrender.com/api/v1/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: selectedDoctor.id,
            date: selectedDate.toISOString().split("T")[0],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBookingSuccess(true);
        setSelectedDate(undefined);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedDoctor(null);
        }, 2000);
      } else {
        setBookingError(data.message || "Booking failed");
      }
    } catch (error) {
      setBookingError("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
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
                <Link href="/patient/appointments">
                  <Clock className="h-4 w-4 mr-2" />
                  My Appointments
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
          <h2 className="text-3xl font-bold mb-2">Find Your Doctor</h2>
          <p className="text-muted-foreground">
            Search and book appointments with qualified healthcare professionals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedSpecialization}
            onValueChange={setSelectedSpecialization}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={doctor.photo_url || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-lg">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {doctor.specialization}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Appointment</DialogTitle>
                          <DialogDescription>
                            Schedule an appointment with Dr. {doctor.name}
                          </DialogDescription>
                        </DialogHeader>

                        {bookingSuccess ? (
                          <Alert>
                            <AlertDescription>
                              Appointment booked successfully! You will receive
                              a confirmation shortly.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-4">
                            {bookingError && (
                              <Alert variant="destructive">
                                <AlertDescription>
                                  {bookingError}
                                </AlertDescription>
                              </Alert>
                            )}

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Select Date
                              </label>
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date()}
                                className="rounded-md border"
                              />
                            </div>

                            <Button
                              onClick={handleBookAppointment}
                              disabled={!selectedDate || bookingLoading}
                              className="w-full"
                            >
                              {bookingLoading
                                ? "Booking..."
                                : "Confirm Appointment"}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
