"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";
import axios from "axios";

export default function AddMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const triggerPopup = (message, color = "green") => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  const [projectCategory, setProjectCategory] = useState("");
  const categories = ["Builder", "Economy", "Standard", "VedaX"];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [filteredCatalog, setFilteredCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${backendUrl}/project/${projectId}`, {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
          },
        });
        const cat = res.data?.details?.category || "";
        setProjectCategory(cat);
        setSelectedCategory(cat); // Set default to project category
      } catch (err) {
        console.error(err);
        triggerPopup("Failed to fetch project details", "red");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId, backendUrl]);

  // Filter catalog based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCatalog(catalog);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = catalog.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.workType && item.workType.toLowerCase().includes(term))
      );
      setFilteredCatalog(filtered);
    }
  }, [searchTerm, catalog]);
  // Fetch catalog when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    
    const adminToken = localStorage.getItem("adminToken");
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const catalogRes = await axios.get(
          `${backendUrl}/catelog/category/${encodeURIComponent(selectedCategory)}`,
          {
            headers: {
              Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            },
          }
        );
        const catalogList = catalogRes.data || [];
        setCatalog(catalogList);
        setFilteredCatalog(catalogList);
      } catch (err) {
        console.error(err);
        triggerPopup("Failed to fetch catalog", "red");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCatalog();
  }, [selectedCategory, backendUrl]);

  // F
  const handleSelectCatalogItem = (item) => {
    setSelectedCatalogItem(item);
    setName(item.name);
    setImagePreview(item.imageLink || null);
    setSearchTerm(""); // Clear search after selection
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return triggerPopup("Material name is required", "red");
    }

    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("color", color);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post(
        `${backendUrl}/materials/${projectId}`,
        formData,
        {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      triggerPopup("Material added successfully!", "green");
      setTimeout(() => {
        router.push(`/admin/projects/${projectId}/material`);
      }, 1500);
    } catch (err) {
      console.error(err);
      triggerPopup(
        err.response?.data?.message || "Failed to add material",
        "red"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !catalog.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .input-styled {
          border: 1px solid #e2e8f0;
          padding: 10px;
          border-radius: 8px;
          width: 100%;
          font-size: 14px;
        }
        .input-styled:focus {
          outline: none;
          border-color: #e07b63;
        }
        .btn-primary {
          background: #e07b63;
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .btn-primary:hover {
          background: #d06b53;
        }
        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .card {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }
        .catalog-item {
          background: #fafafa;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .catalog-item:hover {
          background: #f1f5f9;
          border-color: #e07b63;
        }
        .catalog-item.selected {
          background: #fff5f2;
          border-color: #e07b63;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
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

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Add Material</h1>
          <p className="text-gray-600">
            Project Category: <span className="font-semibold">{projectCategory}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Catalog Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Select from Catalog</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Category Filter
              </label>
              <select
                className="input-styled"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} {cat === projectCategory ? "(Project Category)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <input
                type="text"
                className="input-styled"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedCatalogItem && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Selected: <strong>{selectedCatalogItem.name}</strong>
                </p>
              </div>
            )}

            <div className="catalog-grid">
              {filteredCatalog.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-full text-center py-8">
                  No materials found
                </p>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item._id}
                    className={`catalog-item ${
                      selectedCatalogItem?._id === item._id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectCatalogItem(item)}
                  >
                    {item.imageLink && (
                      <img
                        src={item.imageLink}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-600">
                      {item.workType || "General"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">₹{item.price}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Material Form */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Material Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  className="input-styled"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter material name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Color/Finish
                </label>
                <input
                  type="text"
                  className="input-styled"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Green, Matte finish"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Material Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-styled"
                />
              </div>

              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preview
                  </label>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Material"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => router.push(`/admin/projects/${projectId}/material`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
