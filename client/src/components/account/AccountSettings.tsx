"use client";

import { avatars } from "@/data/avatars";
import { useState } from "react";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";

// USER types
type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
};

// Account Settings Props
type AccountSettingsProps = {
  user: User | null;
  onUserUpdated: (user: User) => void;
  onBack: () => void;
};

const AccountSettings = ({
  user,
  onUserUpdated,
  onBack,
}: AccountSettingsProps) => {
  const selectedAvatar = user?.avatar || avatars[0];
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Update Avatar
  const handleAvatarChange = async (avatar: string) => {
    // Get token from local storage
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      // Verify token and update avatar
      const res = await fetch("http://localhost:5050/api/users/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar }),
      });

      // Failute to update
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message || "Failed to update avatar");
        return;
      }

      // Success
      onUserUpdated(data);
    } catch (error) {
      console.error("Update avatar error:", error);
    }
  };

  // Signout
  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  // Popup message after any account changes
  const showPopup = (message: string) => {
    setPopupMessage(message);

    setTimeout(() => {
      setPopupMessage("");
    }, 4000);
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto rounded-3xl bg-black p-12">
      <div className="mx-auto max-w-3xl">
        {/* Back to Editor */}
        <button
          onClick={onBack}
          className="mb-6 text-md text-zinc-400 hover:text-white tracking-wide cursor-pointer"
        >
          <i className="bx bx-arrow-back"></i> Back to editor
        </button>

        {/* Header */}
        <h1 className="mb-2 text-2xl font-semibold text-white">
          Account Settings
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          Manage your profile information and avatar.
        </p>

        {/* User Information */}
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-4">
            {/* Current Avatar */}
            <img
              src={selectedAvatar}
              alt="Current avatar"
              className="h-24 w-24 rounded-full bg-zinc-800 object-cover"
            />

            {/* Username and Email */}
            <div>
              <p className="text-lg font-medium text-white">{user?.username}</p>
              <p className="text-sm text-zinc-400">{user?.email}</p>

              <div className="mt-2 flex gap-2">
                {/* Edit Profile */}
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setShowEditProfile(!showEditProfile);
                  }}
                  className="text-xs tacking-wide border border-gray-600 rounded-2xl px-2 py-1 hover:bg-gray-700 cursor-pointer"
                >
                  Edit Profile
                </button>

                {/* Change Password */}
                <button
                  onClick={() => {
                    setShowEditProfile(false);
                    setShowChangePassword(!showChangePassword);
                  }}
                  className="text-xs tacking-wide border border-gray-600 rounded-2xl px-2 py-1 hover:bg-gray-700 cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              {popupMessage && (
                <div className="fixed z-50 top-2 rounded-xl bg-green-600 px-4 py-2 text-md text-white shadow-lg">
                  {popupMessage}
                </div>
              )}
            </div>

            {/* Edit Profile Form */}
            {showEditProfile && (
              <ProfileForm
                user={user}
                onUserUpdated={onUserUpdated}
                onClose={() => {
                  setShowEditProfile(false);
                }}
              />
            )}

            {/* Change Password Form */}
            {showChangePassword && (
              <PasswordForm
                user={user}
                onClose={() => setShowChangePassword(false)}
                onSuccess={() => showPopup("Password changed successfully")}
              />
            )}
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-medium text-white">
            Choose an avatar
          </h2>

          {/* Loop avatars and display options */}
          <div className="grid max-h-84 grid-cols-5 gap-4 overflow-y-auto pr-2">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarChange(avatar)}
                className={`rounded-full border p-1 transition hover:border-white cursor-pointer ${
                  selectedAvatar === avatar ? "border-white" : "border-zinc-700"
                }`}
              >
                <img
                  src={avatar}
                  alt="Avatar option"
                  className="h-31 w-31 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-md text-zinc-400">
            Sign out of your account on this device.
          </p>

          <button
            onClick={handleSignOut}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
};

export default AccountSettings;
