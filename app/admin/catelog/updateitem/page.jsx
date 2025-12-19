"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import Popup from "../../../../component/popup";

export default function UpdateItemPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const itemName = searchParams.get("name") ? decodeURIComponent(searchParams.get("name")) : null;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Economy",
    price: "",
    type: "Normal",
    workType: "Wood Work",
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");

  // Fetch item details
  useEffect(() => {
    if (!itemName || !backendUrl) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/catelog/${itemName}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = response.data;
        setItem(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "Economy",
          price: data.price || "",
          type: data.type || "Normal",
          workType: data.workType || "Wood Work",
        });
        if (data.imageLink) setPreviewImage(data.imageLink);
        if (data.video) setPreviewVideo(data.video);
      } catch (err) {
        setPopupMessage("Failed to load item details");
        setPopupColor("red");
        setShowPopup(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemName, backendUrl, adminToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewVideo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName) {
      setPopupMessage("Item name not found");
      setPopupColor("red");
      setShowPopup(true);
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("workType", formData.workType);

      if (imageFile) formDataToSend.append("image", imageFile);
      if (videoFile && formData.type === "Premium") formDataToSend.append("video", videoFile);

      const response = await axios.patch(
        `${backendUrl}/catelog/${encodeURIComponent(itemName)}`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "multipart/form-data" } }
      );

      setPopupMessage("Catalog item updated successfully!");
      setPopupColor("green");
      setShowPopup(true);
      setTimeout(() => router.push("/admin/catelog/search"), 2000);
    } catch (err) {
      setPopupMessage(err?.response?.data?.message || "Failed to update item");
      setPopupColor("red");
      setShowPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: "#f7f4f1", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ color: "#8f8f8f" }}>Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: "#f7f4f1", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ color: "#e07b63" }}>Item not found</div>
      </div>
    );
  }

  const categories = ["Builder", "Economy", "Standard", "VedaX"];
  const types = ["Normal", "Premium"];
  const workTypes = ["Wood Work", "Main Hardware", "Other Hardware", "Miscellaneous", "Countertop"];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#f7f4f1", fontFamily: "'Space Grotesk', sans-serif" }}>
      {showPopup && (
        <Popup
          message={popupMessage}
          color={popupColor}
          onClose={() => setShowPopup(false)}
          autoClose={true}
          duration={4000}
        />
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm font-semibold mb-4"
            style={{ color: "#e07b63" }}
          >
            ← Back
          </button>
          <h2 className="text-2xl font-semibold" style={{ color: "#111111", letterSpacing: "-0.02em" }}>
            Update Catalog Item
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>
            Edit the details for: <span style={{ fontWeight: 600 }}>{item.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[14px] p-6 mb-6"
            style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(16,16,16,0.08)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa", resize: "vertical" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Work Type
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                >
                  {workTypes.map((wt) => (
                    <option key={wt} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Image
                </label>
                <div className="mt-2">
                  {previewImage && (
                    <div className="mb-3 w-full h-32 rounded-[10px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#f5f5f5" }}>
                      <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm"
                    style={{ color: "#8f8f8f" }}
                  />
                </div>
              </div>

              {formData.type === "Premium" && (
                <div>
                  <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                    Video
                  </label>
                  <div className="mt-2">
                    {previewVideo && (
                      <div className="mb-3 w-full h-32 rounded-[10px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#f5f5f5" }}>
                        <video src={previewVideo} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="block w-full text-sm"
                      style={{ color: "#8f8f8f" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-[10px] text-sm font-semibold transition"
                style={{ backgroundColor: "#f0f0f0", color: "#111111" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#e8e8e8")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-[10px] text-sm text-white font-semibold transition disabled:opacity-60"
                style={{ backgroundColor: "#e07b63" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
              >
                {submitting ? "Updating..." : "Update Item"}
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
