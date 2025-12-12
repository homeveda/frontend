"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import Popup from "../../component/popup";
import logo from "../../images/logo.jpg";
export default function AdminLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  // Simple client-side validation + mock submit

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (
      !form.email ||
      !form.password ||
      (isSignUp && !form.name && !form.confirmPassword)
    ) {
      setPopupMessage("Please fill required fields.");
      setPopupColor("red");
      setShowPopup(true);
      return;
    } else if (isSignUp && form.password !== form.confirmPassword) {
      setPopupMessage("Passwords do not match.");
      setPopupColor("red");
      setShowPopup(true);
      return;
    } else if (isSignUp && isNaN(form.phone)) {
      setPopupMessage("Please enter a valid phone number.");
      setPopupColor("red");
      setShowPopup(true);
      return;
    }
    setLoading(true);
    // Mock request delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    if (isSignUp) {
      handleSignup();
    } else {
      handleLogin();
    }
  };
  const handleLogin = async () => {
    // Implement login logic here
    try {
      const response = await axios.post(`${backendUrl}/user/admin/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("adminToken", response.data.token);
      if (response.status === 200) {
        setPopupMessage("Admin login successful!");
        setPopupColor("green");
        setShowPopup(true);
      } else {
        setPopupMessage("Login failed. Please check your credentials.");
        setPopupColor("red");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage("Login failed. Please check your credentials.");
      setPopupColor("red");
      setShowPopup(true);
    }
  };

  const handleSignup = async () => {
    // Implement signup logic here
    try {
      const response = await axios.post(`${backendUrl}/user/admin`, {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      console.log(response);
      if (response.status === 201) {
        setPopupMessage("Signup successful!");
        setPopupColor("green");
        setShowPopup(true);
      } else {
        setPopupMessage("Signup failed. Please check your details.");
        setPopupColor("red");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage("Signup failed. Please check your details.");
      setPopupColor("red");
      setShowPopup(true);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
  };

  const accent = "--primary"; // css var used in style below

  return (
    <div className="admin-auth-root">
      <div>
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor} // 'red' | 'green' | 'yellow'
            onClose={() => setShowPopup(false)}
            autoClose={true} // optional, defaults to true
            duration={5000} // optional, defaults to 5000ms
          />
        )}
      </div>
      <style>{`
				@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
				:root{
					--bg: #f7f4f1; /* light beige background */
					--card: #ffffff;
					--primary: #e07b63; /* warm peach inferred from logo */
					--accent: #111111; /* dark text */
					--muted: #8f8f8f;
					--glass: rgba(255,255,255,0.7);
				}
				*{box-sizing:border-box}
				body,html,#__next{height:100%}
				.admin-auth-root{
					font-family: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
					min-height:100vh;
					display:flex;
					align-items:center;
					justify-content:center;
					background: radial-gradient(circle at 10% 10%, rgba(224,123,99,0.06), transparent 10%), var(--bg);
					padding:28px;
				}
				.card{
					width:100%;
					max-width:920px;
					display:grid;
					grid-template-columns: 1fr 420px;
					gap:24px;
					background: linear-gradient(180deg, var(--card), #fbfbfb);
					border-radius:14px;
					box-shadow:0 10px 30px rgba(16,16,16,0.08);
					padding:28px;
					align-items:center;
				}
				.brand{
					padding:22px;
				}
				.brand h1{
					margin:0 0 8px 0;
					color:var(--accent);
					letter-spacing:-0.02em;
				}
				.brand p{color:var(--muted);margin:0 0 18px 0}
				.art{
					height:240px;
					border-radius:10px;
					background: linear-gradient(135deg, rgba(224,123,99,0.12), rgba(17,17,17,0.03));
					display:flex;
					align-items:center;
					justify-content:center;
					color:var(--primary);
					font-weight:700;
					font-size:42px;
					overflow:hidden;
				}
				.controls{
					display:flex;
					gap:8px;
					margin-bottom:10px;
				}
				.tab{
					padding:8px 14px;
					border-radius:8px;
					cursor:pointer;
					color:var(--muted);
					font-weight:600;
				}
				.tab.active{ color:var(--card); background:var(--primary); box-shadow:0 6px 18px rgba(224,123,99,0.12) }
				form{display:flex;flex-direction:column;gap:12px}
				label{font-size:13px;color:var(--muted);}
				input{padding:12px 14px;border-radius:10px;border:1px solid #e9e6e3;background:transparent;outline:none}
				.row{display:flex;gap:10px}
				.submit{background:var(--primary);color:white;padding:12px;border-radius:10px;border:none;cursor:pointer;font-weight:600}
				.submit[disabled]{opacity:0.6;cursor:default}
				.muted{font-size:13px;color:var(--muted)}
				@media (max-width:880px){
					.card{grid-template-columns:1fr;}
					.art{height:180px}
				}
			`}</style>

      <motion.div
        className="card"
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={cardVariants}
      >
        <div className="brand">
          <h1 className="font-bold text-4xl">
            home<span className="text-[#e07b63]">veda</span>
          </h1>
          <p>Admin portal</p>

          <motion.div
            className="art "
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <Image
              src={logo}
              alt="Homeveda Logo"
              style={{ objectFit: "cover" }}
            />
          </motion.div>

          <div style={{ marginTop: 18 }} className="muted">
            Use your admin credentials to sign in. This is a client mock; wire
            up your auth endpoint to integrate.
          </div>
        </div>

        <motion.div
          style={{ padding: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.05 } }}
        >
          <div className="controls" role="tablist" aria-label="Auth tabs">
            <div
              role="tab"
              aria-selected={!isSignUp}
              className={`tab ${!isSignUp ? "active" : ""}`}
              onClick={() => setIsSignUp(false)}
            >
              Login
            </div>
            <div
              role="tab"
              aria-selected={isSignUp}
              className={`tab ${isSignUp ? "active" : ""}`}
              onClick={() => setIsSignUp(true)}
            >
              Sign up
            </div>
          </div>

          <motion.div
            key={isSignUp ? "signup" : "login"}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <form
              onSubmit={handleSubmit}
              aria-label={isSignUp ? "Sign up form" : "Login form"}
            >
              {isSignUp && (
                <div className="flex gap-4 items-center">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div className="flex gap-4 items-center">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@gmail.com"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4 items-center">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="xxxxx-xxxxxx"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col ">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <div className="muted">
                    {isSignUp
                      ? "Create a new admin account"
                      : "Welcome back — please sign in"}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -2 }}
                    className="submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : isSignUp
                      ? "Create account"
                      : "Sign in"}
                  </motion.button>
                </div>
                <div>
                  {!isSignUp && (
                    <button className="text-sm text-blue-500 underline cursor-pointer" onClick={() => router.push("/forgetpassword")}>
                      forget password
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
