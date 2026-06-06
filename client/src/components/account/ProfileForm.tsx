import { useState } from "react";
import { ChangeEventHandler, SubmitEventHandler } from "react";

// USER types
type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
};

// Profile Form Props
type ProfileFormProps = {
  user: User | null;
  onUserUpdated: (user: User) => void;
  onClose: () => void;
};

const ProfileForm = ({ user, onUserUpdated, onClose }: ProfileFormProps) => {
  // Form with current user info
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  // Update form values with changes
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Changes to username/email
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      // Get the token for the current user
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      // Verify token and Update username
      const usernameRes = await fetch(
        "http://localhost:5050/api/auth/username",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: form.username,
          }),
        },
      );
      const usernameData = await usernameRes.json();
      if (!usernameRes.ok) {
        console.log(usernameData.message || "Failed to update username");
        return;
      }

      // Update email
      const emailRes = await fetch("http://localhost:5050/api/auth/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: form.email,
        }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        console.log(emailData.message || "Failed to update email");
        return;
      }

      // Update parent user state
      if (user) {
        onUserUpdated({
          ...user,
          ...usernameData,
          ...emailData,
        });
      }

      console.log("Profile updated:", emailData);
      onClose();
    } catch (error) {
      console.log("Failed to update profile", error);
    }
  };

  return (
    <div className="ml-8 p-4 rounded-2xl bg-black w-full max-w-84">
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="flex flex-col mb-2">
          <label htmlFor="username" className="text-sm">
            Username
          </label>

          <input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full max-w-64 rounded-lg bg-zinc-900 px-2 py-1"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm">
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full max-w-64 rounded-lg bg-zinc-900 px-2 py-1"
          />
        </div>

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
            Save Profile
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfileForm;
