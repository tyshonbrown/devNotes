"use client";

import Logo from "@/components/logo";
import { useState } from "react";
import Link from "next/link";
import type { SubmitEventHandler, ChangeEventHandler } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  // Types of form data
  type SignupFormData = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  // Form
  const [form, setForm] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Update form when input values are entered
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sign up
  const handleSignup: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Clear any previous error
    setError("");

    try {
      // Send form to backend signup controller
      const res = await fetch("http://localhost:5050/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // Get response
      const data = await res.json();

      // Signup fail
      if (!res.ok) {
        setError(data.message || "Signup failed");
        console.log(data.message || "Signup failed");
        return;
      }

      // Signup success
      console.log("Signup successful:", data);

      // Save JWT token
      sessionStorage.setItem("token", data.token);

      // Go to Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-blue-950/20 text-gray-100">
      <div className="flex min-h-screen flex-col px-6 py-6">
        {/* Logo */}
        <div className="mb-16">
          <Logo />

          {/* Back to Landing Page */}
          <div className="mt-6 space-x-2 text-lg">
            <i className="bx bx-left-arrow-alt"></i>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </div>
        </div>

        {/* Signup Form */}
        <div className="flex flex-1 items-center justify-center">
          {/* White background */}
          <div className="w-full max-w-md rounded-2xl bg-gray-100 p-8">
            {/* Title */}
            <h2 className="text-center text-4xl font-semibold leading-tight tracking-tight text-black">
              Signup
            </h2>

            <form onSubmit={handleSignup} className="text-black">
              {/* Username */}
              <div className="flex flex-col gap-2 mb-6">
                <label
                  htmlFor="username"
                  className="text-lg font-medium text-gray-800"
                >
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-400 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 mb-6">
                <label
                  htmlFor="email"
                  className="text-lg font-medium text-gray-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-400 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 mb-6">
                <label
                  htmlFor="password"
                  className="text-lg font-medium text-gray-800"
                >
                  Password
                </label>

                <div className="flex flex-row gap-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-400 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  {/* View Password Option */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-600 hover:text-black"
                  >
                    <i
                      className={
                        showPassword
                          ? "bx bx-hide text-xl"
                          : "bx bx-show text-xl"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2 mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="text-lg font-medium text-gray-800"
                >
                  Confirm Password
                </label>

                <div className="flex flex-row gap-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-400 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  {/* View Password Option */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-600 hover:text-black"
                  >
                    <i
                      className={
                        showPassword
                          ? "bx bx-hide text-xl"
                          : "bx bx-show text-xl"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-4 mb-2 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;
