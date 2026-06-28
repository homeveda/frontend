"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "../../../../../component/loadingSpinner";
import Popup from "../../../../../component/popup";
import axios from "axios";

const FILE_ICONS = {
  pdf: "📄",
  doc: "📝",
  image: "🖼️",
};

function getFileExtLabel(fileLink) {
  if (!fileLink) return "";
  if (fileLink.match(/\.pdf$/i)) return "PDF";
  if (fileLink.match(/\.(doc|docx)$/i)) return "DOC";
  if (fileLink.match(/\.(xls|xlsx)$/i)) return "XLSX";
  if (fileLink.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "IMAGE";
  return "FILE";
}

function getFileIcon(fileType, fileLink) {
  if (fileType === "pdf") return "📄";
  if (fileType === "doc") return "📝";
  if (fileType === "image") return "🖼️";
  // Fallback from link
  if (fileLink) {
    if (fileLink.match(/\.(xls|xlsx)$/i)) return "📊";
    if (fileLink.match(/\.pdf$/i)) return "📄";
    if (fileLink.match(/\.(doc|docx)$/i)) return "📝";
  }
  return "📎";
}

function getFileName(fileLink) {
  if (!fileLink) return "Unknown file";
  try {
    const parts = fileLink.split("/");
    const raw = parts[parts.length - 1];
    // Remove the timestamp prefix (e.g., "1234567890-")
    const cleaned = raw.replace(/^\d+-/, "").replace(/_/g, " ");
    return decodeURIComponent(cleaned);
  } catch {
    return "Unknown file";
  }
}

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const [items, setItems] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const triggerPopup = (message, color = "green") => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const headers = {
        Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
      };

      // Fetch project details to get userEmail
      const projectRes = await axios.get(
        `${backendUrl}/project/${projectId}`,
        { headers }
      );
      setUserEmail(projectRes.data?.details?.userEmail || "");

      // Fetch orders
      const res = await axios.get(`${backendUrl}/orders/${projectId}`, {
        headers,
      });
      setItems(res.data?.order?.items || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        triggerPopup("Failed to fetch orders", "red");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [projectId, backendUrl]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      await axios.post(`${backendUrl}/orders/${projectId}`, formData, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      triggerPopup(
        `${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully!`,
        "green"
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
      triggerPopup(
        err.response?.data?.message || "Failed to upload files",
        "red"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleUpload(files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = async (itemId) => {
    setConfirmDeleteId(null);
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete(`${backendUrl}/orders/${projectId}/${itemId}`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      triggerPopup("File deleted successfully!", "green");
      fetchOrders();
    } catch (err) {
      console.error(err);
      triggerPopup(
        err.response?.data?.message || "Failed to delete file",
        "red"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ord-page { background: #f7f4f1; min-height: 100vh; font-family: 'Space Grotesk', sans-serif; padding: 24px; }
        .ord-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
        @media(min-width:640px) { .ord-header { flex-direction: row; align-items: center; justify-content: space-between; } }
        .ord-title { font-size: 28px; font-weight: 700; color: #111; letter-spacing: -0.02em; margin: 0; }
        .ord-subtitle { font-size: 14px; color: #8f8f8f; margin: 4px 0 0; }
        .ord-actions { display: flex; gap: 12px; align-items: center; }
        .ord-btn { padding: 10px 20px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
        .ord-btn-primary { background: #e07b63; color: #fff; }
        .ord-btn-primary:hover { background: #d06b53; }
        .ord-btn-primary:disabled { background: #e0a090; cursor: not-allowed; }
        .ord-btn-back { background: transparent; color: #e07b63; font-weight: 700; border: none; padding: 10px 0; }
        .ord-btn-back:hover { text-decoration: underline; }

        .ord-dropzone {
          border: 2px dashed #d4cfc9;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          background: #fff;
          margin-bottom: 28px;
        }
        .ord-dropzone:hover, .ord-dropzone.dragging {
          border-color: #e07b63;
          background: #fef7f5;
        }
        .ord-dropzone-icon { font-size: 48px; margin-bottom: 12px; }
        .ord-dropzone-text { font-size: 15px; color: #555; font-weight: 500; }
        .ord-dropzone-hint { font-size: 12px; color: #aaa; margin-top: 6px; }

        .ord-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .ord-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(15,23,42,0.07);
          border: 1px solid #efe7e2;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .ord-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,23,42,0.12); }
        .ord-card-icon {
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          background: linear-gradient(135deg, #f8f6f4, #f0ece8);
        }
        .ord-card-body { padding: 16px; }
        .ord-card-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ord-card-type {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 12px;
          background: #f3f0ed;
          color: #8f8f8f;
          margin-bottom: 12px;
        }
        .ord-card-actions { display: flex; gap: 8px; }
        .ord-card-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s;
          text-align: center;
          text-decoration: none;
        }
        .ord-card-btn-view { background: #f1f5f9; color: #475569; }
        .ord-card-btn-view:hover { background: #e2e8f0; }
        .ord-card-btn-delete { background: #fef2f2; color: #ef4444; }
        .ord-card-btn-delete:hover { background: #fee2e2; }

        .ord-empty { text-align: center; padding: 64px 24px; color: #8f8f8f; }
        .ord-empty-icon { font-size: 56px; margin-bottom: 16px; }
        .ord-empty-text { font-size: 15px; }

        .ord-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; backdrop-filter: blur(4px);
        }
        .ord-modal {
          background: #fff; border-radius: 16px; padding: 28px 24px;
          max-width: 380px; width: 90%; text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          font-family: 'Space Grotesk', sans-serif;
        }
        .ord-modal-icon { font-size: 44px; margin-bottom: 12px; }
        .ord-modal-title { font-size: 18px; font-weight: 700; color: #111; margin: 0 0 6px; }
        .ord-modal-text { font-size: 13px; color: #8f8f8f; margin: 0 0 24px; }
        .ord-modal-actions { display: flex; gap: 10px; }
        .ord-modal-btn { flex: 1; padding: 10px 16px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
        .ord-modal-cancel { background: #f3f0ed; color: #555; }
        .ord-modal-cancel:hover { background: #e9e6e3; }
        .ord-modal-confirm { background: #ef4444; color: #fff; }
        .ord-modal-confirm:hover { background: #dc2626; }
      `}</style>

      <div className="ord-page">
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor}
            onClose={() => setShowPopup(false)}
          />
        )}

        {/* Header */}
        <div className="ord-header">
          <div>
            <h1 className="ord-title">📦 Project Orders</h1>
            <p className="ord-subtitle">
              Upload and manage order files — PDFs, Excel, Word documents
            </p>
          </div>
          <div className="ord-actions">
            <button
              className="ord-btn ord-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading…" : "Upload Files"}
            </button>
            <button
              className="ord-btn ord-btn-back"
              onClick={() =>
                router.push(
                  `/admin/projects?userEmail=${encodeURIComponent(userEmail)}`
                )
              }
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Drop Zone */}
        <div
          className={`ord-dropzone${isDragging ? " dragging" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="ord-dropzone-icon">
            {isUploading ? "⏳" : "📁"}
          </div>
          <p className="ord-dropzone-text">
            {isUploading
              ? "Uploading files…"
              : "Drag & drop files here, or click to browse"}
          </p>
          <p className="ord-dropzone-hint">
            Supports PDF, Word, Excel, and images (up to 10 files)
          </p>
        </div>

        {/* File Grid */}
        {items.length === 0 ? (
          <div className="ord-empty">
            <div className="ord-empty-icon">📭</div>
            <p className="ord-empty-text">No order files uploaded yet</p>
          </div>
        ) : (
          <div className="ord-grid">
            {items.map((item) => {
              const icon = getFileIcon(item.fileType, item.fileLink);
              const name = getFileName(item.fileLink);
              const ext = getFileExtLabel(item.fileLink);
              const isImage =
                item.fileType === "image" ||
                (item.fileLink &&
                  item.fileLink.match(/\.(jpg|jpeg|png|gif|webp)$/i));

              return (
                <div key={item._id} className="ord-card">
                  {isImage && item.fileLink ? (
                    <img
                      src={item.fileLink}
                      alt={name}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        background: "#f1f5f9",
                      }}
                    />
                  ) : (
                    <div className="ord-card-icon">{icon}</div>
                  )}
                  <div className="ord-card-body">
                    <p className="ord-card-name" title={name}>
                      {name}
                    </p>
                    <span className="ord-card-type">{ext}</span>
                    <div className="ord-card-actions">
                      <a
                        href={item.fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ord-card-btn ord-card-btn-view"
                      >
                        View / Download
                      </a>
                      <button
                        className="ord-card-btn ord-card-btn-delete"
                        onClick={() => setConfirmDeleteId(item._id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="ord-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
            <div className="ord-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ord-modal-icon">🗑️</div>
              <p className="ord-modal-title">Delete this file?</p>
              <p className="ord-modal-text">This action cannot be undone. The file will be permanently removed.</p>
              <div className="ord-modal-actions">
                <button className="ord-modal-btn ord-modal-cancel" onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </button>
                <button className="ord-modal-btn ord-modal-confirm" onClick={() => handleDelete(confirmDeleteId)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
