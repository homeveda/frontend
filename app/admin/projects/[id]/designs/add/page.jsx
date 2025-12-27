"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";
import axios from "axios";
//Have too make it so AddItem button triggers on Enter
const AddDesignPage = () => {
  const router = useRouter();
  const params = useParams();
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
  const triggerPopup = (message, color) => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDesignFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesignPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    document.getElementById("image-file-input").value = "";
    document.getElementById("design-file-input").value = "";
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(items);
    if (items.length === 0) {
      triggerPopup("Please add at least one design item.", "red");
      return;
    }

    setIsLoading(true);
    setShowPopup(false);

    const formData = new FormData();
    formData.append("projectId", projectId);
    console.log(formData);

    items.forEach((item, index) => {
      formData.append(`items[${index}][name]`, item.name);

      if (item.imageFile) {
        formData.append(`items[${index}][image]`, item.imageFile);
      }

      if (item.designFile) {
        formData.append(`items[${index}][design]`, item.designFile);
      }
    });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/designs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      triggerPopup("Designs added successfully!", "green");
      setItems([]);

      setTimeout(() => {
        router.push(`/admin/projects/${projectId}/designs`);
      }, 2000);
    } catch (err) {
      triggerPopup(err.message, "red");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEnterClick = async (e) => {
    console.log(e.key);
    if (e.key == "Enter") {
      handleAddItem();
    }
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
      <div
        className="admin-page-font"
        style={{
          backgroundColor: "var(--bg)",
          minHeight: "100vh",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor}
            onClose={() => setShowPopup(false)}
          />
        )}
        <div className="container mx-auto px-4">
          <h1
            className="text-4xl font-bold mb-8"
            style={{ color: "var(--accent)" }}
          >
            Add Designs for Project
          </h1>

          <div
            className="mb-8 p-6 md:p-8 rounded-xl shadow-lg"
            style={{ backgroundColor: "var(--card)" }}
          >
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--accent)" }}
            >
              Add a New Design Item
            </h2>
            <div className="grid gap-6 mb-4">
              <div>
                <label
                  htmlFor="design-name"
                  className="text-sm font-medium mb-1 block"
                  style={{ color: "var(--muted)" }}
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="design-name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                  className="input-styled w-full"
                />
              </div>
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="image-file-input"
                    className="text-sm font-medium mb-1 block"
                    style={{ color: "var(--muted)" }}
                  >
                    Image File (png, jpeg, jpg)
                  </label>
                  <input
                    id="image-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageFileChange}
                    className="input-styled file-input-styled w-full"
                  />
                  {imagePreview && (
                    <div className="preview-container">
                      <img
                        src={imagePreview}
                        alt="Image preview"
                        className="preview-img"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="design-file-input"
                    className="text-sm font-medium mb-1 block"
                    style={{ color: "var(--muted)" }}
                  >
                    Design File (png, jpeg, jpg)
                  </label>
                  <input
                    id="design-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleDesignFileChange}
                    className="input-styled file-input-styled w-full"
                  />
                  {designPreview && (
                    <div className="preview-container">
                      <img
                        src={designPreview}
                        alt="Design preview"
                        className="preview-img"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleAddItem}
                onKeyDown={handleEnterClick}
                className="btn-primary"
              >
                Add Item
              </button>
            </div>
          </div>

          <div
            className="p-6 md:p-8 rounded-xl shadow-lg"
            style={{ backgroundColor: "var(--card)" }}
          >
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--accent)" }}
            >
              Staged Design Items ({items.length})
            </h2>
            {items.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>
                No items added yet. Add items using the form above.
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "#f9f9f9" }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p
                        className="font-semibold text-lg"
                        style={{ color: "var(--accent)" }}
                      >
                        {item.name}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {item.imagePreview && (
                        <div>
                          <p
                            className="text-xs mb-2"
                            style={{ color: "var(--muted)" }}
                          >
                            Image: {item.imageFile.name}
                          </p>
                          <img
                            src={item.imagePreview}
                            alt={`${item.name} image`}
                            className="preview-img"
                          />
                        </div>
                      )}
                      {item.designPreview && (
                        <div>
                          <p
                            className="text-xs mb-2"
                            style={{ color: "var(--muted)" }}
                          >
                            Design: {item.designFile.name}
                          </p>
                          <img
                            src={item.designPreview}
                            alt={`${item.name} design`}
                            className="preview-img"
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading || items.length === 0}
              className="btn-primary"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? "Submitting..." : `Submit ${items.length} Design(s)`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDesignPage;
