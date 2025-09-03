"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, User, Heart, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    password: "",
    photo_url: "",
  });

  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    photo_url: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const router = useRouter();

  const specializations = [
    "Cardiologist",
    "Dentist",
    "Neurologist",
    "Pediatrician",
    "Dermatologist",
    "Orthopedic",
    "Psychiatrist",
    "General Physician",
  ];

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!patientData.name || !patientData.email || !patientData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://appointment-manager-node.onrender.com/api/v1/auth/register/patient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patientData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !doctorData.name ||
      !doctorData.email ||
      !doctorData.password ||
      !doctorData.specialization
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://appointment-manager-node.onrender.com/api/v1/auth/register/doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doctorData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-16 left-12 w-20 h-20 bg-green-100 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-teal-100 rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute bottom-24 left-16 w-24 h-24 bg-cyan-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-40 right-12 w-14 h-14 bg-green-200 rounded-full opacity-60 animate-bounce"></div>

      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#118659] rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#118659]">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Join our healthcare platform and start your journey
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/50 p-1 h-12">
              <TabsTrigger
                value="patient"
                className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <User className="h-4 w-4 text-[#118659]" />
                Patient
              </TabsTrigger>
              <TabsTrigger
                value="doctor"
                className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Stethoscope className="h-4 w-4 text-[#118659]" />
                Doctor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="mt-6">
              <form onSubmit={handlePatientSubmit} className="space-y-5">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label
                    htmlFor="patient-name"
                    className="text-gray-700 font-medium"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="patient-name"
                    placeholder="Enter your full name"
                    value={patientData.name}
                    onChange={(e) =>
                      setPatientData({ ...patientData, name: e.target.value })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="patient-email"
                    className="text-gray-700 font-medium"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="Enter your email"
                    value={patientData.email}
                    onChange={(e) =>
                      setPatientData({ ...patientData, email: e.target.value })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="patient-password"
                    className="text-gray-700 font-medium"
                  >
                    Password *
                  </Label>
                  <Input
                    id="patient-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={patientData.password}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        password: e.target.value,
                      })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="patient-photo"
                    className="text-gray-700 font-medium"
                  >
                    Photo URL (Optional)
                  </Label>
                  <Input
                    id="patient-photo"
                    placeholder="Enter your photo URL"
                    value={patientData.photo_url}
                    onChange={(e) =>
                      setPatientData({
                        ...patientData,
                        photo_url: e.target.value,
                      })
                    }
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#118659] hover:bg-[#0f7a50] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Create Patient Account
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="doctor" className="mt-6">
              <form onSubmit={handleDoctorSubmit} className="space-y-5">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label
                    htmlFor="doctor-name"
                    className="text-gray-700 font-medium"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="doctor-name"
                    placeholder="Enter your full name"
                    value={doctorData.name}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, name: e.target.value })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="doctor-email"
                    className="text-gray-700 font-medium"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="Enter your email"
                    value={doctorData.email}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, email: e.target.value })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="doctor-password"
                    className="text-gray-700 font-medium"
                  >
                    Password *
                  </Label>
                  <Input
                    id="doctor-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={doctorData.password}
                    onChange={(e) =>
                      setDoctorData({ ...doctorData, password: e.target.value })
                    }
                    required
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="specialization"
                    className="text-gray-700 font-medium"
                  >
                    Specialization *
                  </Label>
                  <Select
                    value={doctorData.specialization}
                    onValueChange={(value) =>
                      setDoctorData({ ...doctorData, specialization: value })
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659]">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec} className="py-3">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-[#118659]" />
                            {spec}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="doctor-photo"
                    className="text-gray-700 font-medium"
                  >
                    Photo URL (Optional)
                  </Label>
                  <Input
                    id="doctor-photo"
                    placeholder="Enter your photo URL"
                    value={doctorData.photo_url}
                    onChange={(e) =>
                      setDoctorData({
                        ...doctorData,
                        photo_url: e.target.value,
                      })
                    }
                    className="h-12 border-gray-200 focus:border-[#118659] focus:ring-[#118659] transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#118659] hover:bg-[#0f7a50] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Create Doctor Account
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Already a member?
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/login"
                className="font-semibold text-[#118659] hover:text-[#0f7a50] transition-colors duration-200"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
