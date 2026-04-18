"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Popup from "../../../../../../component/popup";

const AddInspectionPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id: projectId } = params;

  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [readyForNextPhase, setReadyForNextPhase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  const [categories, setCategories] = useState({
    plumbing: { status: "Pending", video: null, preview: null },
    electricity: { status: "Pending", video: null, preview: null },
    chimneyPoint: { status: "Pending", video: null, preview: null },
    falseCeiling: { status: "Pending", video: null, preview: null },
    flooring: { status: "Pending", video: null, preview: null },
  });

  const [otherVideos, setOtherVideos] = useState([]);
  const [newOtherVideo, setNewOtherVideo] = useState(null);
  const [newOtherVideoPreview, setNewOtherVideoPreview] = useState(null);

  const categoryLabels = {
    plumbing: "Plumbing",
    electricity: "Electricity",
    chimneyPoint: "Chimney Point",
    falseCeiling: "False Ceiling",
    flooring: "Flooring",
  };

  const categoryIcons = {
    plumbing: "🚰",
    electricity: "⚡",
    chimneyPoint: "🏠",
    falseCeiling: "🎨",
    flooring: "🪵",
  };

  const statuses = ["Pending", "In Progress", "Completed","Point Marked", "Not Required"];

  const triggerPopup = (message, color) => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleCategoryVideoChange = (category, e) => {
    const file = e.target.files[0];
    if (file) {
      setCategories((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          video: file,
          preview: URL.createObjectURL(file),
        },
      }));
    }
  };

  const handleCategoryStatusChange = (category, status) => {
    setCategories((prev) => ({
      ...prev,
      [category]: { ...prev[category], status },
    }));
  };

  const handleOtherVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewOtherVideo(file);
      setNewOtherVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddOtherVideo = () => {
    if (newOtherVideo) {
      setOtherVideos((prev) => [...prev, newOtherVideo]);
      setNewOtherVideo(null);
      setNewOtherVideoPreview(null);
      triggerPopup("Video added to other videos", "green");
    }
  };

  const handleRemoveOtherVideo = (index) => {
    setOtherVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const adminToken =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("inspectionDate", inspectionDate);
      formData.append("readyForNextPhase", readyForNextPhase);

      // Add category statuses
      Object.entries(categories).forEach(([key, value]) => {
        const statusKey = key === "chimneyPoint" ? "chimneyPointStatus" : `${key}Status`;
        formData.append(statusKey, value.status);
      });

      // Add category videos
      Object.entries(categories).forEach(([key, value]) => {
        if (value.video) {
          const videoKey = key === "chimneyPoint" ? "chimneyPointVideo" : `${key}Video`;
          formData.append(videoKey, value.video);
        }
      });

      // Add other videos
      otherVideos.forEach((video, index) => {
        formData.append("otherVideos", video);
      });

      const response = await axios.post(
        `${backendUrl}/inspections`,
        formData,
        {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      triggerPopup("Inspection created successfully!", "green");
      setTimeout(() => {
        router.push(`/admin/projects/${projectId}/inspection`);
      }, 1500);
    } catch (error) {
      console.error("Error creating inspection:", error);
      triggerPopup(
        error.response?.data?.message || "Failed to create inspection",
        "red"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
        className="px-4 py-6 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "#f7f4f1",
        minHeight: "100vh",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {showPopup && (
        <Popup message={popupMessage} color={popupColor} />
      )}

        <div className="max-w-7xl mx-auto px-0 sm:px-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold" style={{ color: "#111111" }}>
            Add New Inspection
          </h2>
            <button
              onClick={() => router.back()}
              className="text-lg sm:text-xl font-semibold cursor-pointer whitespace-nowrap"
            style={{ color: "#e07b63" }}
          >
            ← Back
          </button>
        </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          {/* Inspection Date */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Inspection Date
            </label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07b63]"
            />
          </div>

          {/* Categories */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Inspection Categories
            </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {Object.entries(categories).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    {categoryIcons[key]} {categoryLabels[key]}
                  </h4>

                  {/* Status Dropdown */}
                    <div className="mb-2 sm:mb-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={value.status}
                      onChange={(e) =>
                        handleCategoryStatusChange(key, e.target.value)
                      }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#e07b63]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleCategoryVideoChange(key, e)}
                      className="w-full text-xs"
                    />
                    {value.preview && (
                      <div className="mt-2">
                        <video
                          src={value.preview}
                            className="w-full h-20 sm:h-24 object-cover rounded border border-gray-300"
                          controls
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Videos */}
          <div className="mb-6 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Other Videos
            </h3>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Add Other Video
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleOtherVideoChange}
                  className="flex-1 text-xs sm:text-sm w-full sm:w-auto"
                />
                <button
                  type="button"
                  onClick={handleAddOtherVideo}
                  disabled={!newOtherVideo}
                  className="bg-[#e07b63] text-white px-3 sm:px-4 py-2 rounded hover:bg-[#d56a52] disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {newOtherVideoPreview && (
                <video
                  src={newOtherVideoPreview}
                  className="w-full h-24 sm:h-32 object-cover rounded border border-gray-300 mb-3"
                  controls
                />
              )}
            </div>

            {otherVideos.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Videos ({otherVideos.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {otherVideos.map((video, index) => (
                    <div
                      key={index}
                      className="bg-white p-2 rounded border border-gray-300 relative break-words"
                    >
                      <p className="text-xs text-gray-600 mb-1 truncate">
                        {video.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherVideo(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ready for Next Phase */}
          <div className="mb-6 sm:mb-8 flex items-center gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="readyForNextPhase"
              checked={readyForNextPhase}
              onChange={(e) => setReadyForNextPhase(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor="readyForNextPhase"
              className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Ready for Next Phase
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#e07b63] text-white px-4 sm:px-6 py-2 sm:py-3 rounded hover:bg-[#d56a52] disabled:opacity-50 transition-colors font-semibold text-sm sm:text-base order-2 sm:order-1"
            >
              {isLoading ? "Creating..." : "Create Inspection"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-[#e07b63] text-[#e07b63] rounded hover:bg-[#e07b63] hover:text-white transition-colors font-semibold text-sm sm:text-base order-1 sm:order-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInspectionPage;
