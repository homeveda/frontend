"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import LoadingSpinner from "../../../../component/loadingSpinner";
import Popup from "../../../../component/popup";

export default function NewProjectPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const [userEmail, setUserEmail] = useState("");
  const [projectHead, setProjectHead] = useState("");
  const [architectName, setArchitectName] = useState("");
  const [category, setCategory] = useState("Economy");
  const [kind, setKind] = useState("kitchen"); // 'kitchen' or 'wardrobe'
  const COUNTER_OPTIONS = [
    "Inbuilt microwave",
    "Inbuilt refrigerator",
    "Normal fridge single door",
    "Dishwasher",
    "Island chimney",
    "Wall mounted chimney",
    "IGL",
    "Gas cylinder",
    "Inbuilt oven",
    "Normal fridge double door",
    "Ro under sink",
    "Ro above sink",
    "Inbuilt hob",
    "Countertop hob",
  ];

  const [kitchen, setKitchen] = useState({
    kitchenType: "L-Shape",
    requiremntsOfCounter: "Island",
    appliances: [],
    loftRequired: false,
    theme: "Modern",
    layoutPlan: "",
    additionalRequirements: "",
  });
  const [counterOpen, setCounterOpen] = useState(false);
  const counterRef = useRef(null);
  const [wardrobe, setWardrobe] = useState({
    type: "",
    loftRequired: false,
    additionalRequirements: "",
    measureents: "",
  });
  const [kitchenFiles, setKitchenFiles] = useState([]);
  const [wardrobeFiles, setWardrobeFiles] = useState([]);
  const [kitchenPreviews, setKitchenPreviews] = useState([]);
  const [wardrobePreviews, setWardrobePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const submit = async (e) => {
    e.preventDefault();
    if (!backendUrl) return setError("Backend URL not configured");
    try {
      setLoading(true);
      setError(null);
      const adminToken =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      // build multipart form data because layoutPlan and measurements are image uploads
      const form = new FormData();
      form.append("userEmail", userEmail);
      form.append("projectHead", projectHead);
      if (architectName) form.append("architectName", architectName);
      if (category) form.append("category", category);

      if (kind === "kitchen") {
        const appliancesArr = Array.isArray(kitchen.appliances)
          ? kitchen.appliances
          : kitchen.appliances
          ? kitchen.appliances
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        const kitchenPayload = { ...kitchen, appliances: appliancesArr };
        form.append("kitchen", JSON.stringify(kitchenPayload));
        // append kitchen files (layout plans)
        kitchenFiles.forEach((f) => form.append("files", f));
      } else {
        const wardrobePayload = {
          type: wardrobe.type,
          additionalRequirements: wardrobe.additionalRequirements,
        };
        form.append("wardrobe", JSON.stringify(wardrobePayload));
        // append wardrobe files (measurements)
        wardrobeFiles.forEach((f) => form.append("files", f));
      }

      const res = await axios.post(`${backendUrl}/project`, form, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      setPopupMessage("Project created successfully!");
      setPopupColor("green");
      setShowPopup(true);
      setTimeout(
        () =>
          router.push(
            "/admin/projects?userEmail=" + encodeURIComponent(userEmail)
          ),
        2000
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create failed");
      setPopupMessage(
        err?.response?.data?.message || err.message || "Create failed"
      );
      setPopupColor("red");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const email = searchParams.get("userEmail") || "";
    setUserEmail(email);
  }, []);

  // close counter dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        counterOpen &&
        counterRef.current &&
        !counterRef.current.contains(e.target)
      ) {
        setCounterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [counterOpen]);

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "#f7f4f1",
        minHeight: "100vh",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex  mb-6 justify-between">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: "#111111" }}>
              Create New Project
            </h2>
            <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>
              Fill project details for kitchen or wardrobe
            </p>
          </div>
          <div>
            <button
              onClick={() => router.back()}
              className="cursor-pointer font-semibold mb-4"
              style={{ color: "#e07b63" }}
            >
              ← Back
            </button>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="p-4 rounded-[14px]"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 30px rgba(16,16,16,0.08)",
          }}
        >
          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Project Head
            </label>
            <input
              value={projectHead}
              onChange={(e) => setProjectHead(e.target.value)}
              className="px-3 py-2 rounded-[10px]"
              style={{ border: "1px solid #e9e6e3" }}
              required
            />

            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Architect Name (optional)
            </label>
            <input
              value={architectName}
              onChange={(e) => setArchitectName(e.target.value)}
              className="px-3 py-2 rounded-[10px]"
              style={{ border: "1px solid #e9e6e3" }}
            />

            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-[10px]"
              style={{
                border: "1px solid #e9e6e3",
                backgroundColor: "#fafafa",
              }}
            >
              <option>Builder</option>
              <option>Economy</option>
              <option>Standard</option>
              <option>VedaX</option>
            </select>

            <div className="mt-4">
              <label
                className="text-xs font-medium"
                style={{ color: "#8f8f8f" }}
              >
                Project Type
              </label>
              <div className="flex items-center gap-4 mt-2 font-semibold">
                <span style={{ color: "#e07b63" }}>Kitchen</span>
                <button
                  type="button"
                  onClick={() =>
                    setKind(kind === "kitchen" ? "wardrobe" : "kitchen")
                  }
                  className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      kind === "wardrobe" ? "#D85738" : "#e07b63",
                  }}
                >
                  <span
                    className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                    style={{
                      transform:
                        kind === "wardrobe"
                          ? "translateX(28px)"
                          : "translateX(2px)",
                    }}
                  />
                </button>
                <span style={{ color: "#e07b63" }}>Wardrobe</span>
              </div>
            </div>

            {kind === "kitchen" && (
              <div className="mt-3">
                <label
                  className="text-xs font-medium"
                  style={{ color: "#8f8f8f" }}
                >
                  Kitchen Type
                </label>
                <select
                  value={kitchen.kitchenType}
                  onChange={(e) =>
                    setKitchen((prev) => ({
                      ...prev,
                      kitchenType: e.target.value,
                    }))
                  }
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
                  style={{
                    border: "1px solid #e9e6e3",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <option>L-Shape</option>
                  <option>U-Shape</option>
                  <option>Parallel</option>
                  <option>Straight</option>
                </select>

                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Requirements of Counter
                </label>
                <label
                  className="text-xs mt-2 block"
                  style={{ color: "#8f8f8f" }}
                >
                  <div className="w-full relative" ref={counterRef}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setCounterOpen(!counterOpen);
                      }}
                      className="w-full min-h-[44px] flex flex-wrap items-center gap-2 p-2 rounded-[10px]"
                      style={{
                        border: "1px solid #e9e6e3",
                        backgroundColor: "#fafafa",
                        cursor: "pointer",
                      }}
                    >
                      {kitchen.appliances && kitchen.appliances.length > 0 ? (
                        kitchen.appliances.map((a, idx) => (
                          <div
                            key={a + idx}
                            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm"
                            style={{ boxShadow: "0 1px 0 rgba(16,16,16,0.04)" }}
                          >
                            <span>{a}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          Select requirements
                        </span>
                      )}
                      <div className="ml-auto text-gray-400">▾</div>
                    </div>
                    {counterOpen && (
                      <div
                        className="absolute mt-1 bg-white rounded shadow-md z-50"
                        style={{
                          maxHeight: 220,
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {COUNTER_OPTIONS.map((opt) => {
                          const selected = (kitchen.appliances || []).includes(
                            opt
                          );

                          return (
                            <div
                              key={opt}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setKitchen((prev) => {
                                  const current = Array.isArray(prev.appliances)
                                    ? prev.appliances
                                    : [];
                                  const isSelected = current.includes(opt);
                                  return {
                                    ...prev,
                                    appliances: isSelected
                                      ? current.filter((x) => x !== opt)
                                      : [...current, opt],
                                  };
                                });
                              }}
                              className="p-2 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
                              style={{
                                backgroundColor: selected ? "#e07b63" : "white",
                                color: selected ? "white" : "black",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  readOnly
                                  tabIndex={-1}
                                  className="accent-white pointer-events-none"
                                />
                                <span className="text-sm">{opt}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </label>

                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Theme
                </label>
                <select
                  value={kitchen.theme}
                  onChange={(e) =>
                    setKitchen({ ...kitchen, theme: e.target.value })
                  }
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{
                    border: "1px solid #e9e6e3",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <option>Classical</option>
                  <option>Modern</option>
                  <option>Modern luxury</option>
                  <option>Modern minimalist</option>
                  <option>Minimalist</option>
                  <option>Contemporary</option>
                  <option>Japandi</option>
                  <option>Mid-century</option>
                </select>

                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Layout plan (upload images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setKitchenFiles(files);
                    const previews = files.map((f) => ({
                      name: f.name,
                      url: URL.createObjectURL(f),
                    }));
                    // revoke previous previews
                    kitchenPreviews.forEach(
                      (p) => p.url && URL.revokeObjectURL(p.url)
                    );
                    setKitchenPreviews(previews);
                  }}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 text-sm file:border file:border-gray-300 file:rounded file:px-3 file:py-1 file:bg-gray-100 file:text-sm file:cursor-pointer"
                />

                {kitchenPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {kitchenPreviews.map((p, idx) => (
                      <div
                        key={p.url}
                        className="w-full h-20 rounded-[8px] overflow-hidden flex items-center justify-center relative"
                        style={{ backgroundColor: "#f5f5f5" }}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="object-contain max-h-full max-w-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nf = kitchenFiles.slice();
                            nf.splice(idx, 1);
                            setKitchenFiles(nf);
                            const np = kitchenPreviews.slice();
                            URL.revokeObjectURL(np[idx].url);
                            np.splice(idx, 1);
                            setKitchenPreviews(np);
                          }}
                          className="absolute top-1 right-1 bg-black/40 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Loft Required
                </label>
                <div className="flex items-center gap-4 mt-2 font-semibold">
                  <span style={{ color: "#e07b63" }}>No</span>
                  <button
                    type="button"
                    onClick={() =>
                      setKitchen((prev) => ({
                        ...prev,
                        loftRequired: !prev.loftRequired,
                      }))
                    }
                    className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        kitchen.loftRequired === true ? "#e07b63" : "#000000",
                    }}
                  >
                    <span
                      className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                      style={{
                        transform:
                          kitchen.loftRequired === true
                            ? "translateX(28px)"
                            : "translateX(2px)",
                      }}
                    />
                  </button>
                  <span style={{ color: "#e07b63" }}>Yes</span>
                </div>
                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Additional requirements
                </label>
                <textarea
                  value={kitchen.additionalRequirements}
                  onChange={(e) =>
                    setKitchen((prev) => ({
                      ...prev,
                      additionalRequirements: e.target.value,
                    }))
                  }
                  className="mt-2 block w-full rounded-[10px] px-3 py-2"
                  style={{ border: "1px solid #e9e6e3" }}
                />
              </div>
            )}

            {kind === "wardrobe" && (
              <div className="mt-3">
                <label className=" font-medium">Types</label>
                <div className="mt-2 flex flex-col gap-3 text-xl">
                  {["Hinged", "Sliding"].map((option) => {
                    const types = Array.isArray(wardrobe.type)
                      ? wardrobe.type
                      : wardrobe.type
                      ? wardrobe.type
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];
                    const isSelected = types.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-2 text-xl"
                        style={{ color: "#8f8f8f" }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentTypes = Array.isArray(wardrobe.type)
                              ? wardrobe.type
                              : wardrobe.type
                              ? wardrobe.type
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : [];
                            const newTypes = e.target.checked
                              ? [...currentTypes, option]
                              : currentTypes.filter((t) => t !== option);
                            setWardrobe({
                              ...wardrobe,
                              type: newTypes,
                            });
                          }}
                          className="rounded accent-[#e07b63]"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    );
                  })}
                </div>

                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Measurements (upload images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setWardrobeFiles(files);
                    const previews = files.map((f) => ({
                      name: f.name,
                      url: URL.createObjectURL(f),
                    }));
                    wardrobePreviews.forEach(
                      (p) => p.url && URL.revokeObjectURL(p.url)
                    );
                    setWardrobePreviews(previews);
                  }}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 text-sm file:border file:border-gray-300 file:rounded file:px-3 file:py-1 file:bg-gray-100 file:text-sm file:cursor-pointer"
                />

                {wardrobePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {wardrobePreviews.map((p, idx) => (
                      <div
                        key={p.url}
                        className="w-full h-20 rounded-[8px] overflow-hidden flex items-center justify-center relative"
                        style={{ backgroundColor: "#f5f5f5" }}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="object-contain max-h-full max-w-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nf = wardrobeFiles.slice();
                            nf.splice(idx, 1);
                            setWardrobeFiles(nf);
                            const np = wardrobePreviews.slice();
                            URL.revokeObjectURL(np[idx].url);
                            np.splice(idx, 1);
                            setWardrobePreviews(np);
                          }}
                          className="absolute top-1 right-1 bg-black/40 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label
                  className="text-xs font-medium mt-3"
                  style={{ color: "#8f8f8f" }}
                >
                  Additional requirements
                </label>
                <textarea
                  value={wardrobe.additionalRequirements}
                  onChange={(e) =>
                    setWardrobe({
                      ...wardrobe,
                      additionalRequirements: e.target.value,
                    })
                  }
                  className="mt-2 block w-full rounded-[10px] px-3 py-2"
                  style={{ border: "1px solid #e9e6e3" }}
                />
              </div>
            )}

            {error && (
              <div className="text-sm" style={{ color: "#e07b63" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="text-white px-4 py-2 rounded-[10px] font-semibold transition"
                style={{ backgroundColor: "#e07b63" }}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="px-4 py-2 rounded-[10px]"
                style={{ border: "1px solid #e9e6e3" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
