"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function AdminLoginPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ email: "", password: "", name: "" });

	// Simple client-side validation + mock submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		// basic validation
		if (!form.email || !form.password || (isSignUp && !form.name)) {
			alert("Please fill required fields.");
			return;
		}
		setLoading(true);
		// Mock request delay
		await new Promise((r) => setTimeout(r, 800));
		setLoading(false);
		if (isSignUp) {
			console.log("Sign up data:", form);
			alert("Signed up (mock). Check console for payload.");
		} else {
			console.log("Login data:", form);
			alert("Logged in (mock). Check console for payload.");
		}
	};

	const cardVariants = {
		hidden: { opacity: 0, y: 20 },
		enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
		exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-7" style={{ fontFamily: "'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", background: "radial-gradient(circle at 10% 10%, rgba(224,123,99,0.06), transparent 10%), #f7f4f1" }}>
			{/* Font import (kept here so the component uses the requested font). You may move this to globals.css if you prefer. */}
			<style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');"}</style>

			<motion.div className="w-full max-w-5xl grid gap-6 bg-white rounded-xl shadow-lg p-7 md:grid-cols-[1fr_420px]" initial="hidden" animate="enter" exit="exit" variants={cardVariants}>
				{/* Left / Brand */}
				<div className="space-y-4">
					<h1 className="text-3xl font-semibold text-[#111111]">homeveda</h1>
					<p className="text-sm text-gray-500">Admin portal — secure access to catalogue & projects</p>

					<motion.div className="h-60 rounded-lg flex items-center justify-center text-4xl font-bold text-[#e07b63] mt-4" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 120 }} style={{ background: "linear-gradient(135deg, rgba(224,123,99,0.12), rgba(17,17,17,0.03))" }}>
						H V
					</motion.div>

					<p className="text-sm text-gray-500">Use your admin credentials to sign in. This is a client mock; wire up your auth endpoint to integrate.</p>
				</div>

				{/* Right / Auth Form */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }} className="pt-1">
					<div className="flex gap-2 mb-3" role="tablist" aria-label="Auth tabs">
						<button
							role="tab"
							aria-selected={!isSignUp}
							onClick={() => setIsSignUp(false)}
							className={`px-3 py-2 rounded-lg font-semibold ${!isSignUp ? 'bg-[#e07b63] text-white shadow-md' : 'text-gray-500'}`}
						>
							Login
						</button>
						<button
							role="tab"
							aria-selected={isSignUp}
							onClick={() => setIsSignUp(true)}
							className={`px-3 py-2 rounded-lg font-semibold ${isSignUp ? 'bg-[#e07b63] text-white shadow-md' : 'text-gray-500'}`}
						>
							Sign up
						</button>
					</div>

					<motion.div key={isSignUp ? "signup" : "login"} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
						<form onSubmit={handleSubmit} aria-label={isSignUp ? "Sign up form" : "Login form"} className="flex flex-col gap-3">
							{isSignUp && (
								<div>
									<label htmlFor="name" className="text-sm text-gray-500">Full name</label>
									<input id="name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 bg-transparent focus:outline-none" />
								</div>
							)}

							<div>
								<label htmlFor="email" className="text-sm text-gray-500">Email</label>
								<input id="email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@homeveda.com" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 bg-transparent focus:outline-none" />
							</div>

							<div>
								<label htmlFor="password" className="text-sm text-gray-500">Password</label>
								<input id="password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 bg-transparent focus:outline-none" />
							</div>

							<div className="flex items-center justify-between mt-2">
								<div className="text-sm text-gray-500">{isSignUp ? "Create a new admin account" : "Welcome back — please sign in"}</div>
								<motion.button whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} className="px-4 py-3 bg-[#e07b63] text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-60" type="submit" disabled={loading}>
									{loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
								</motion.button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}