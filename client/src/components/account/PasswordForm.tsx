import { useState } from "react";
import { ChangeEventHandler, SubmitEventHandler } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// USER types
type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
};

// Profile Form Props
type PasswordFormProps = {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
};

const PasswordForm = ({ user, onClose, onSuccess }: PasswordFormProps) => {
  // Form
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Update form values with changes
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Password Change
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Clear old error messages
    setError("");

    try {
      // Get the token for the current user
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      // Verify token and update password
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      // Error
      if (!res.ok) {
        setError(data.message || "Failed to change password");
        console.log(data.message || "Failed to change password");
        return;
      }

      // Success, reset form
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      console.log("Password updated", data);

      // Close form
      onSuccess();
      onClose();
    } catch (error) {
      console.log("Failed to change password", error);
    }
  };

  return (
    <div className="ml-8 p-4 rounded-2xl bg-black w-full max-w-84">
      <form onSubmit={handleSubmit}>
        {/* Current Password */}
        <div className="flex flex-col mb-2">
          <label htmlFor="currentPassword" className="text-sm">
            Current Password
          </label>

          <input
            id="currentPassword"
            type="text"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-900 px-2 py-1"
          />
        </div>

        {/* New Password */}
        <div className="flex flex-col mb-2">
          <label htmlFor="newPassword" className="text-sm">
            New Password
          </label>

          <input
            id="newPassword"
            type="text"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-900 px-2 py-1"
          />
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-sm">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="text"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-900 px-2 py-1"
          />
        </div>

        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}

        <div className="flex gap-2">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-lg text-sm bg-gray-600 px-4 py-1 text-white hover:bg-gray-500 cursor-pointer"
          >
            Cancel
          </button>

          {/* Save */}
          <button
            type="submit"
            className="mt-4 rounded-lg text-sm bg-blue-600 px-4 py-1 text-white hover:bg-blue-500 cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;
