"use client";

import Logo from "@/components/logo";
import { useState } from "react";
import Link from "next/link";
import type { SubmitEventHandler, ChangeEventHandler } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Set type of data for login
  type LoginFormData = {
    email: string;
    password: string;
  };

  // useState that follows the LoginFormData shape
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Update Form as the input values are entered
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Clear any old error
    setError("");

    try {
      // Send form to backend login controller
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // get response
      const data = await res.json();

      // login fail
      if (!res.ok) {
        setError(data.message || "Login failed");
        console.log(data.message || "Login failed");
        return;
      }

      // login success
      console.log("Login successful:", data);

      // Save JWT token
      sessionStorage.setItem("token", data.token);

      // Go to Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-blue-950/20 text-gray-100">
      <div className="flex min-h-screen flex-col px-6 py-6">
        {/* Logo */}
        <div className="mb-16">
          <Logo />

          {/* Back to Landing */}
          <div className="mt-6 space-x-2 text-lg">
            <i className="bx bx-left-arrow-alt"></i>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-1 items-center justify-center">
          {/* White background */}
          <div className="w-full max-w-md rounded-2xl bg-gray-100 p-8">
            {/* Title */}
            <h2 className="text-center text-4xl font-semibold leading-tight tracking-tight text-black">
              Login
            </h2>

            <form onSubmit={handleLogin} className="mt-8 text-black">
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

              {error && (
                <p className="mt-4 mb-2 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-500 cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="flex flex-row gap-2 mt-2">
              <p className="text-black">Don't have an account? </p>
              <Link href="/signup" className="text-blue-500 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
