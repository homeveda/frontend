"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../component/loadingSpinner";
import axios from "axios";

const statusColors = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#10b981",
  "Not Required": "#9ca3af",
};

const statusBgColors = {
  Pending: "#fef3c7",
  "In Progress": "#dbeafe",
  Completed: "#dcfce7",
  "Not Required": "#f3f4f6",
};

export default function InspectionPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getInspections = async () => {
      try {
        const response = await axios.get(`${backendUrl}/inspections/${id}`, {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
          },
        });
        setInspections(response.data.inspections);
      } catch (error) {
        console.error("Error fetching inspections:", error);
      } finally {
        setLoading(false);
      }
    };

    getInspections();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const latestInspection = inspections.length > 0 ? inspections[0] : null;

  const inspectionCategories = [
    {
      name: "Plumbing",
      statusKey: "plumbingStatus",
      videoKey: "plumbingVideo",
      icon: "🚰",
    },
    {
      name: "Electricity",
      statusKey: "electricityStatus",
      videoKey: "electricityVideo",
      icon: "⚡",
    },
    {
      name: "Chimney Point",
      statusKey: "chimneyPointStatus",
      videoKey: "chimneyPointVideo",
      icon: "🏠",
    },
    {
      name: "False Ceiling",
      statusKey: "falseCeilingStatus",
      videoKey: "falseCeilingVideo",
      icon: "🎨",
    },
    {
      name: "Flooring",
      statusKey: "flooringStatus",
      videoKey: "flooringVideo",
      icon: "🪵",
    },
  ];

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "#f7f4f1",
        minHeight: "100vh",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold" style={{ color: "#111111" }}>
            Project Inspections
          </h2>
          <div className="flex items-center gap-2">
            {!latestInspection && (
              <button
                onClick={() => {
                  router.push(`/admin/projects/${id}/inspection/add`);
                }}
                className="bg-[#e07b63] text-white px-4 py-2 rounded hover:bg-[#d56a52] transition-colors"
              >
                Add Inspection
              </button>
            )}
            {latestInspection && (
              <button
                onClick={() => {
                  router.push(`/admin/projects/${id}/inspection/update`);
                }}
                className="bg-[#f7f4f1] text-[#e07b63] border-[#e07b63] border px-4 py-2 rounded hover:bg-[#e07b63] hover:text-white transition-colors"
              >
                Update Inspection
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="text-xl font-semibold cursor-pointer"
              style={{ color: "#e07b63" }}
            >
              ← Back
            </button>
          </div>
        </div>
            
        {!latestInspection ? (
          <div className="text-center py-12">
            <p className="text-[#8f8f8f] text-lg">No inspections found</p>
          </div>
        ) : (
          <>
            {/* Inspection Date */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <p className="text-sm text-gray-600">Inspection Date:</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(latestInspection.inspectionDate).toLocaleDateString()}
              </p>
            </div>
              {/* Ready for Next Phase */}
            {latestInspection.readyForNextPhase && (
              <div className="my-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-800 font-semibold">
                  ✓ Ready for Next Phase
                </p>
              </div>
            )}
            {/* Inspection Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {inspectionCategories.map((category) => {
                const status = latestInspection[category.statusKey];
                const videoUrl = latestInspection[category.videoKey];

                // Skip cards with "Not Required" status
                if (status === "Not Required") {
                  return null;
                }

                return (
                  <div
                    key={category.statusKey}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Video Section */}
                    {videoUrl ? (
                      <div className="relative h-48 bg-gray-200">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                        {/* <div className="absolute top-2 left-2 bg-[#e07b63] text-white px-2 py-1 rounded text-xs font-semibold">
                          {category.icon} {category.name}
                        </div> */}
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{category.icon}</div>
                          <p className="text-gray-500">{category.name}</p>
                          <p className="text-sm text-gray-400">No video</p>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {category.icon}{category.name}
                      </h3>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: statusBgColors[status] || "#f3f4f6",
                            color: statusColors[status] || "#6b7280",
                          }}
                        >
                          {status || "Pending"}
                        </span>
                      </div>

                      {/* View Video Button */}
                      {videoUrl && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block bg-[#e07b63] text-white text-center py-2 rounded hover:bg-[#d56a52] transition-colors text-sm font-medium"
                        >
                          View Full Video
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
             
            {/* Other Videos Section */}
            {latestInspection.otherVideos && latestInspection.otherVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Other Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {latestInspection.otherVideos.map((videoUrl, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <video
                        src={videoUrl}
                        className="w-full h-40 object-cover bg-gray-200"
                        controls
                      />
                      <div className="p-3 flex gap-2">
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#e07b63] text-white text-center py-2 rounded text-sm hover:bg-[#d56a52] transition-colors"
                        >
                          View Video
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           
          </>
        )}
      </div>
    </div>
  );
}