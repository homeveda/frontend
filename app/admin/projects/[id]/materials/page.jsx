"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "../../../../../component/loadingSpinner";
import Popup from "../../../../../component/popup";
import axios from "axios";

export default function MaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const [materials, setMaterials] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  const triggerPopup = (message, color = "green") => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");

      // Fetch project details to get userEmail
      const projectRes = await axios.get(`${backendUrl}/project/${projectId}`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      const email = projectRes.data?.details?.userEmail || "";
      setUserEmail(email);

      // Fetch materials
      const res = await axios.get(`${backendUrl}/materials/${projectId}`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      const materialsList = res.data?.materials?.materials || [];
      setMaterials(materialsList);
    } catch (err) {
      console.error(err);
      triggerPopup("Failed to fetch materials", "red");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [projectId, backendUrl]);

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;

    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete(`${backendUrl}/materials/${projectId}/${materialId}`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      triggerPopup("Material deleted successfully!", "green");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      triggerPopup(
        err.response?.data?.message || "Failed to delete material",
        "red",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .btn-primary {
          background: #e07b63;
          color: #fff;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: #d06b53;
        }
        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-secondary:hover {
          background: #e2e8f0;
        }
        .btn-danger {
          background: #ef4444;
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }
        .btn-danger:hover {
          background: #dc2626;
        }
        .material-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }
        .material-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
        }
        .material-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background: #f1f5f9;
        }
        .material-content {
          padding: 16px;
        }
        .material-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #1e293b;
        }
        .material-color {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 12px;
        }
        .material-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .material-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
      `}</style>

      <div className="p-4 sm:p-6">
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor}
            onClose={() => setShowPopup(false)}
          />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Project Materials
            </h1>
            <p className="text-gray-600">Manage materials for this project</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              className="btn-primary flex-1 sm:flex-none"
              onClick={() =>
                router.push(`/admin/projects/${projectId}/materials/add`)
              }
            >
              + Add Material
            </button>
            <button
              onClick={() =>
                router.push(
                  `/admin/projects?userEmail=${encodeURIComponent(userEmail)}`,
                )
              }
              className="cursor-pointer font-semibold "
              style={{ color: "#e07b63" }}
            >
              ← Back
            </button>
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No materials found for this project
            </p>
            <button
              className="btn-primary"
              onClick={() =>
                router.push(`/admin/projects/${projectId}/materials/add`)
              }
            >
              Add First Material
            </button>
          </div>
        ) : (
          <div className="material-grid">
            {materials.map((material) => (
              <div key={material._id} className="material-card">
                {material.imageLink ? (
                  <img
                    src={material.imageLink}
                    alt={material.name}
                    className="material-image"
                  />
                ) : (
                  <div
                    className="material-image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#e2e8f0",
                      color: "#94a3b8",
                      fontSize: "14px",
                    }}
                  >
                    No Image
                  </div>
                )}

                <div className="material-content">
                  <h3 className="material-title">{material.name}</h3>
                  {material.color && (
                    <p className="material-color">
                      <strong>Color:</strong> {material.color}
                    </p>
                  )}

                  <div className="material-actions">
                    <button
                      className="btn-secondary flex-1"
                      onClick={() =>
                        router.push(
                          `/admin/projects/${projectId}/materials/update?materialId=${material._id}`,
                        )
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger flex-1"
                      onClick={() => handleDeleteMaterial(material._id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
