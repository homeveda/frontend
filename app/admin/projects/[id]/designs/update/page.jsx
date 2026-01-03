"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";

export default function AddDesignPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params;

  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newDesignFile, setNewDesignFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const [removedIds, setRemovedIds] = useState([]);

  const triggerPopup = (message, color) => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  useEffect(() => {
    const fetchDesigns = async () => {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
        const res = await axios.get(
          `${backendUrl}/designs/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        const data = res.data && res.data.designs ? res.data.designs : res.data;
        // Flatten all design items across design docs, keep designId and itemId
        const mapped = [];
        if (Array.isArray(data)) {
          data.forEach((design) => {
            const designId = design._id || design.id;
            (design.items || []).forEach((it) => {
              mapped.push({
                id: Date.now() + Math.random(),
                designId,
                itemId: it._id || it.id,
                name: it.name || "",
                originalName: it.name || "",
                imagePreview: it.imageLink || null,
                designPreview: it.designLink || null,
                originalImageLink: it.imageLink || null,
                originalDesignLink: it.designLink || null,
                imageFile: null,
                designFile: null,
              });
            });
          });
        }
        setItems(mapped);
      } catch (err) {
        triggerPopup(err.message || "Failed to load designs", "red");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) fetchDesigns();
  }, [projectId]);

  const handleImageFileChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, imageFile: file, imagePreview: reader.result } : it))
      );
    };
    reader.readAsDataURL(file);
  };

  const handleDesignFileChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setItems((prev) =>
        prev.map((it, i) => (i === idx ? { ...it, designFile: file, designPreview: reader.result } : it))
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      triggerPopup("Item name is required.", "red");
      return;
    }

    if (!newImageFile && !newDesignFile) {
      triggerPopup("Please select an image file or a design file.", "red");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newItemName,
      imageFile: newImageFile,
      designFile: newDesignFile,
      imagePreview: imagePreview,
      designPreview: designPreview,
    };
    setItems([...items, newItem]);

    setNewItemName("");
    setNewImageFile(null);
    setNewDesignFile(null);
    setImagePreview(null);
    setDesignPreview(null);
    document.getElementById("update-image-file") && (document.getElementById("update-image-file").value = "");
    document.getElementById("update-design-file") && (document.getElementById("update-design-file").value = "");
  };

  const handleRemoveItem = (idx) => {
    const it = items[idx];
    if (it && it.itemId && it.designId) {
      setRemovedIds((r) => [...r, { designId: it.designId, itemId: it.itemId }]);
    }
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleNameChange = (idx, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, name: value } : it)));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    // Determine operations: deletes, patches (existing items), and posts (new items)
    if (items.length === 0 && removedIds.length === 0) {
      triggerPopup("No changes to submit.", "red");
      return;
    }

    setIsLoading(true);
    setShowPopup(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      // 1) Deletes
      for (const del of removedIds) {
        await axios.delete(`${backendUrl}/designs/${del.designId}/items/${del.itemId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
      }

      // 2) Patches for existing items
      const patchPromises = [];
      const newItems = [];

      items.forEach((item) => {
        const needsPatch =
          item.itemId && (item.imageFile || item.designFile || item.name !== item.originalName);

        if (item.itemId && needsPatch) {
          const fd = new FormData();
          if (item.name !== undefined) fd.append("name", item.name);
          if (item.imageFile) fd.append("image", item.imageFile);
          if (item.designFile) fd.append("design", item.designFile);

          patchPromises.push(
            axios.patch(`${backendUrl}/designs/${item.designId}/items/${item.itemId}`, fd, {
              headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            })
          );
        }

        // collect newly added items (no itemId)
        if (!item.itemId) newItems.push(item);
      });

      await Promise.all(patchPromises);

      // 3) POST new items in one request (if any)
      if (newItems.length > 0) {
        const fd = new FormData();
        fd.append("projectId", projectId);
        newItems.forEach((it, idx) => {
          fd.append(`items[${idx}][name]`, it.name || "");
          if (it.imageFile) fd.append(`items[${idx}][image]`, it.imageFile);
          if (it.designFile) fd.append(`items[${idx}][design]`, it.designFile);
        });
        await axios.post(`${backendUrl}/designs`, fd, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
      }

      triggerPopup("Designs updated successfully!", "green");
      setRemovedIds([]);
      setTimeout(() => router.push(`/admin/projects/${projectId}/designs`), 1500);
    } catch (err) {
      console.error(err);
      triggerPopup(err.response?.data?.message || err.message || "Update failed", "red");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClick = (e) => {
    if (e.key === "Enter") handleAddItem();
  };

    return (
    <>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
          :root {
            --bg: #f7f4f1;
            --card: #ffffff;
            --primary: #e07b63;
            --accent: #111111;
            --muted: #8f8f8f;
          }
          .admin-page-font {
            font-family: 'Space Grotesk', sans-serif;
          }
          .input-styled {
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid #e9e6e3;
            background: transparent;
            outline: none;
            transition: border-color 0.2s;
          }
          .input-styled:focus {
            border-color: var(--primary);
          }
          .btn-primary {
            background-color: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
          }
          .btn-primary:hover {
            background-color: #d46a52;
          }
          .btn-primary[disabled] {
            opacity: 0.6;
            cursor: default;
          }
          .file-input-styled::-webkit-file-upload-button {
            background: #fdf6f4;
            color: #e07b63;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            margin-right: 12px;
          }
          .preview-img {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e9e6e3;
          }
          .preview-container {
            display: flex;
            gap: 12px;
            margin-top: 8px;
            flex-wrap: wrap;
          }
        `}</style>
      <div className="admin-page-font" style={{ backgroundColor: "var(--bg)", minHeight: "100vh", paddingTop: "2rem", paddingBottom: "2rem" }}>
        {showPopup && (
          <Popup message={popupMessage} color={popupColor} onClose={() => setShowPopup(false)} />
        )}
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8" style={{ color: "var(--accent)" }}>Update Designs for Project</h1>

          <div className="mb-8 p-6 md:p-8 rounded-xl shadow-lg" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--accent)" }}>Add a New Design Item</h2>
            <div className="grid gap-6 mb-4">
              <div>
                <label htmlFor="design-name" className="text-sm font-medium mb-1 block" style={{ color: "var(--muted)" }}>Item Name</label>
                <input type="text" id="design-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Enter item name" className="input-styled w-full" />
              </div>
              <div>
                <div className="mb-4">
                  <label htmlFor="update-image-file" className="text-sm font-medium mb-1 block" style={{ color: "var(--muted)" }}>Image File (png, jpeg, jpg)</label>
                  <input id="update-image-file" type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} className="input-styled file-input-styled w-full" />
                  {imagePreview && (
                    <div className="preview-container"><img src={imagePreview} alt="Image preview" className="preview-img" /></div>
                  )}
                </div>
                <div>
                  <label htmlFor="update-design-file" className="text-sm font-medium mb-1 block" style={{ color: "var(--muted)" }}>Design File (png, jpeg, jpg)</label>
                  <input id="update-design-file" type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewDesignFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setDesignPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} className="input-styled file-input-styled w-full" />
                  {designPreview && (
                    <div className="preview-container"><img src={designPreview} alt="Design preview" className="preview-img" /></div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right"><button onClick={handleAddItem} onKeyDown={handleEnterClick} className="btn-primary">Add Item</button></div>
          </div>

          <div className="p-6 md:p-8 rounded-xl shadow-lg" style={{ backgroundColor: "var(--card)" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>Staged Design Items ({items.length})</h2>
            {isLoading ? (<div className="py-10 flex justify-center"><LoadingSpinner /></div>) : items.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No items added yet. Add items using the form above or fetch failed.</p>
            ) : (
              <ul className="space-y-4">
                {items.map((item, idx) => (
                  <li key={item.id} className="p-4 rounded-lg" style={{ backgroundColor: "#f9f9f9" }}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-semibold text-lg" style={{ color: "var(--accent)" }}>{item.name || 'Untitled'}</p>
                      <button onClick={() => handleRemoveItem(idx)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-xs font-semibold">Remove</button>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Image: {item.imageFile ? item.imageFile.name : item.imagePreview ? 'Current' : 'None'}</p>
                        {item.imagePreview ? (
                          <img src={item.imagePreview} alt={`${item.name} image`} className="preview-img" />
                        ) : (
                          <div className="preview-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>No Image</div>
                        )}
                        <div className="mt-2"><input type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => handleImageFileChange(e, idx)} className="input-styled file-input-styled" id={`image-file-${item.id}`} /></div>
                      </div>
                      <div>
                        <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Design: {item.designFile ? item.designFile.name : item.designPreview ? 'Current' : 'None'}</p>
                        {item.designPreview ? (
                          <img src={item.designPreview} alt={`${item.name} design`} className="preview-img" />
                        ) : (
                          <div className="preview-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>No Design</div>
                        )}
                        <div className="mt-2"><input type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => handleDesignFileChange(e, idx)} className="input-styled file-input-styled" id={`design-file-${item.id}`} /></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={handleSubmit} disabled={isLoading || (items.length === 0 && removedIds.length === 0)} className="btn-primary">
              {isLoading && <LoadingSpinner />}
              {isLoading ? "Submitting..." : `Submit Changes`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
