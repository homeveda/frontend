"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import logo from "../../../images/logo.jpg";
import Popup from "../../../component/popup.jsx";
import Image from "next/image";

export default function UserLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    confirmPassword: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
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
    }
    setLoading(true);
    // Request delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    if (isSignUp) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${backendUrl}/user/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userEmail", form.email);
      if (response.status === 200) {
        setPopupMessage("User login successful!");
        setPopupColor("green");
        setShowPopup(true);
        setTimeout(() => {
          router.push("/");
          //Need to redirect to user dashboard
        }, 1500);
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
    try {
      const response = await axios.post(`${backendUrl}/user`, {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone || "",
        address: form.address || "",
      });
      console.log(response);
      if (response.status === 201) {
        setPopupMessage("Signup successful! Please login.");
        setPopupColor("green");
        setShowPopup(true);
        setForm({
          email: "",
          password: "",
          name: "",
          phone: "",
          address: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setIsSignUp(false);
        }, 1500);
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

  return (
    <div className="user-auth-root">
      <div>
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor}
            onClose={() => setShowPopup(false)}
            autoClose={true}
            duration={5000}
          />
        )}
      </div>
      <style>{`
				@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
				:root{
					--bg: #f7f4f1;
					--card: #ffffff;
					--primary: #e07b63;
					--accent: #111111;
					--muted: #8f8f8f;
					--glass: rgba(255,255,255,0.7);
				}
				*{box-sizing:border-box}
				body,html,#__next{height:100%}
				.user-auth-root{
					font-family: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
					min-height:100vh;
					display:flex;
					align-items:center;
					justify-content:center;
					background: radial-gradient(circle at 10% 10%, rgba(224,123,99,0.06), transparent 10%), var(--bg);
					padding:16px;
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
				.brand{padding:22px}
				.brand h1{margin:0 0 8px 0;color:var(--accent);letter-spacing:-0.02em;font-size:2.5rem;font-weight:700}
				.brand p{color:var(--muted);margin:0 0 18px 0;font-size:14px}
				.art{
					height:240px;border-radius:10px;background:linear-gradient(135deg,rgba(224,123,99,0.12),rgba(17,17,17,0.03));
					display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:700;font-size:42px;overflow:hidden
				}
				.controls{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
				.tab{padding:8px 14px;border-radius:8px;cursor:pointer;color:var(--muted);font-weight:600;background:transparent;border:none;font-size:14px;white-space:nowrap}
				.tab.active{color:var(--card);background:var(--primary);box-shadow:0 6px 18px rgba(224,123,99,0.12)}
				form{display:flex;flex-direction:column;gap:12px}
				label{font-size:13px;color:var(--muted)}
				input{padding:12px 14px;border-radius:10px;border:1px solid #e9e6e3;background:transparent;outline:none;font-family:inherit;font-size:16px;width:100%}
				input:focus{border-color:var(--primary);background:rgba(224,123,99,0.02)}
				.row{display:flex;gap:10px;flex-wrap:wrap}
				.submit{background:var(--primary);color:white;padding:12px;border-radius:10px;border:none;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit;transition:all 0.2s ease}
				.submit:hover:not([disabled]){background:#d66b52;box-shadow:0 6px 18px rgba(224,123,99,0.2)}
				.submit[disabled]{opacity:0.6;cursor:default}
				.muted{font-size:13px;color:var(--muted);line-height:1.4}
				.form-group{display:flex;gap:12px;align-items:center;flex-direction:column;align-items:flex-start;gap:8px}
				.form-group label{width:100%;display:block}
				.form-group input{width:100%}

				@media (max-width:1024px){
					.card{grid-template-columns:1fr;padding:20px;gap:20px}
					.art{height:200px}
					.brand{padding:16px}
					.brand h1{font-size:2rem}
				}
				
				@media (max-width:768px){
					.user-auth-root{padding:12px}
					.card{padding:16px;gap:16px;border-radius:12px}
					.brand{padding:12px}
					.brand h1{font-size:1.75rem;margin-bottom:12px}
					.art{height:160px;font-size:36px;margin:12px 0}
					.muted{font-size:12px}
					label{font-size:12px}
					input{padding:10px 12px;font-size:16px}
					.tab{padding:6px 12px;font-size:13px}
					form{gap:10px}
					.submit{padding:10px 12px;font-size:13px}
				}
				
				@media (max-width:480px){
					.user-auth-root{padding:8px;min-height:100vh}
					.card{grid-template-columns:1fr;padding:12px;gap:12px;max-width:100%;border-radius:10px}
					.brand{padding:8px}
					.brand h1{font-size:1.5rem;margin-bottom:8px}
					.art{height:140px;font-size:32px;margin:8px 0;border-radius:8px}
					.controls{gap:6px;margin-bottom:8px}
					.tab{padding:6px 10px;font-size:12px;border-radius:6px}
					label{font-size:11px;margin-bottom:4px}
					input{padding:10px;font-size:16px;border-radius:8px}
					form{gap:8px}
					.muted{font-size:11px;line-height:1.3}
					.submit{padding:10px;font-size:12px;border-radius:8px}
					.submit:disabled{opacity:0.5}
					.form-group{gap:8px}
				}
				
				@media (max-width:360px){
					.card{padding:8px}
					.brand h1{font-size:1.25rem}
					.art{height:120px;font-size:28px}
					input{font-size:14px;padding:8px}
					label{font-size:10px}
					.tab{padding:5px 8px;font-size:11px}
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
          <h1>User portal</h1>

          <motion.div
            className="art"
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
            Create an account or sign in to access designs, quotations, and
            manage your projects.
          </div>
        </div>

        <motion.div
          style={{ padding: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.05 } }}
        >
          <div className="controls" role="tablist" aria-label="Auth tabs">
            <button
              role="tab"
              aria-selected={!isSignUp}
              className={`tab ${!isSignUp ? "active" : ""}`}
              onClick={() => setIsSignUp(false)}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={isSignUp}
              className={`tab ${isSignUp ? "active" : ""}`}
              onClick={() => setIsSignUp(true)}
            >
              Sign up
            </button>
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
                <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@homeveda.com"
                />
              </div>

              <div className="form-group">
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
                <>
                  <div className="form-group">
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
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="xxxxx-xxxxx"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Your address here"
                    />
                  </div>
                </>
              )}
              <div style={{ marginTop: 6 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="muted">
                    {isSignUp
                      ? "Create a new account"
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
                <div style={{ marginTop: 8 }}>
                  {!isSignUp && (
                    <button
                      type="button"
                      style={{
                        fontSize: "13px",
                        color: "#007bff",
                        textDecoration: "underline",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        fontFamily: "inherit",
                      }}
                      onClick={() => router.push("/forgetpassword")}
                    >
                      Forget password?
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
