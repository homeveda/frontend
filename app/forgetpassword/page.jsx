"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import Popup from "../../component/popup";
import logo from "../../images/logo.jpg";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setPopupMessage("Please enter your email address.");
      setPopupColor("red");
      setShowPopup(true);
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/user/forgot-password`, {
        email: email,
      });
      console.log(response.data);
      setLoading(false);
      setPopupMessage("Password reset link has been sent to your email!");
      setPopupColor("green");
      setShowPopup(true);
      setEmail("");
    } catch (error) {
      setLoading(false);
      setPopupMessage("Failed to send reset link. Please try again.");
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
    <div className="forget-password-root">
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
        .forget-password-root{
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
        form{display:flex;flex-direction:column;gap:12px}
        label{font-size:13px;color:var(--muted)}
        input{padding:12px 14px;border-radius:10px;border:1px solid #e9e6e3;background:transparent;outline:none;font-size:16px;width:100%;font-family:inherit}
        input:focus{border-color:var(--primary);background:rgba(224,123,99,0.02)}
        .row{display:flex;gap:10px;flex-wrap:wrap}
        .submit{background:var(--primary);color:white;padding:12px;border-radius:10px;border:none;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit;transition:all 0.2s ease}
        .submit:hover:not([disabled]){background:#d66b52;box-shadow:0 6px 18px rgba(224,123,99,0.2)}
        .submit[disabled]{opacity:0.6;cursor:default}
        .muted{font-size:13px;color:var(--muted);line-height:1.4}
        .back-button{background:none;border:none;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;margin-top:12px}

        @media (max-width:1024px){
          .card{grid-template-columns:1fr;padding:20px;gap:20px}
          .art{height:200px}
          .brand{padding:16px}
          .brand h1{font-size:2rem}
        }
        
        @media (max-width:768px){
          .forget-password-root{padding:12px}
          .card{padding:16px;gap:16px;border-radius:12px}
          .brand{padding:12px}
          .brand h1{font-size:1.75rem;margin-bottom:12px}
          .art{height:160px;font-size:36px;margin:12px 0}
          .muted{font-size:12px}
          label{font-size:12px}
          input{padding:10px 12px;font-size:16px}
          form{gap:10px}
          .submit{padding:10px 12px;font-size:13px}
        }
        
        @media (max-width:480px){
          .forget-password-root{padding:8px;min-height:100vh}
          .card{grid-template-columns:1fr;padding:12px;gap:12px;max-width:100%;border-radius:10px}
          .brand{padding:8px}
          .brand h1{font-size:1.5rem;margin-bottom:8px}
          .art{height:140px;font-size:32px;margin:8px 0;border-radius:8px}
          label{font-size:11px;margin-bottom:4px}
          input{padding:10px;font-size:16px;border-radius:8px}
          form{gap:8px}
          .muted{font-size:11px;line-height:1.3}
          .submit{padding:10px;font-size:12px;border-radius:8px}
          .submit:disabled{opacity:0.5}
        }
        
        @media (max-width:360px){
          .card{padding:8px}
          .brand h1{font-size:1.25rem}
          .art{height:120px;font-size:28px}
          input{font-size:14px;padding:8px}
          label{font-size:10px}
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
              Reset your password
          </h1>

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
            Enter your email address and we'll send you a link to reset your
            password.
          </div>
        </div>

        <motion.div
          style={{ padding: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.05 } }}
        >
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <form onSubmit={handleSubmit} aria-label="Forget password form">
              <div className="flex gap-4 items-center">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex flex-col">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <div className="muted">
                    Enter your email to receive a reset link
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -2 }}
                    className="submit"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </motion.button>
                </div>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => router.push("/")}
                >
                  Back to login
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}