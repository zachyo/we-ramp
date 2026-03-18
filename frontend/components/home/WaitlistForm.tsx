"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list! We'll notify you when we launch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row gap-3"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading" || status === "success"}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="btn-primary whitespace-nowrap px-6"
        >
          {status === "loading" ? "Joining..." : "Join Waitlist"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-3 text-sm text-green-400 animate-fade-up text-center font-medium">
          {message}
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400 animate-fade-up text-center">
          {message}
        </p>
      )}
    </div>
  );
}
