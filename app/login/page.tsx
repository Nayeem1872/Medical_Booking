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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, User, Heart } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !role) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://appointment-manager-node.onrender.com/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        try {
          console.log("Login response data:", data);
          console.log("User data to store:", data.user);
          console.log("Token to store:", data.token);

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Verify what was actually stored
          const storedUser = localStorage.getItem("user");
          console.log("Stored user data:", storedUser);

          setTimeout(() => {
            // Redirect based on role
            if (role === "PATIENT") {
              router.replace("/patient/dashboard");
            } else {
              router.replace("/doctor/dashboard");
            }
          }, 100);
        } catch (storageError) {
          console.error("Error storing user data:", storageError);
          setError("Failed to save login data. Please try again.");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-cyan-100 rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-32 right-10 w-12 h-12 bg-blue-200 rounded-full opacity-60 animate-bounce"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Sign in to your account to continue your healthcare journey
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="role" className="text-gray-700 font-medium">
                Login as
              </Label>
              <Select
                value={role}
                onValueChange={(value: "PATIENT" | "DOCTOR") => setRole(value)}
              >
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-green-500" />
                      <span>Patient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DOCTOR">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-5 w-5 text-blue-500" />
                      <span>Doctor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  New to our platform?
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Create one here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
