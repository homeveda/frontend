"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";
import axios from "axios";

export default function QuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogErrorMessage, setCatalogErrorMessage] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(false);
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

  // Department -> WorkType mapping (matches backend catelogModel)
  const DEPARTMENT_WORKTYPE_MAP = {
    Kitchen: ["Carcass", "Shutters", "Visibles", "Base And Back", "Basic Hardware", "Additional Hardware", "Other Hardware", "Countertop", "Appliances"],
    Wardrobe: ["Carcass", "Shutters", "Base And Back", "Visibles", "Basic Hardware", "Additional Hardware", "Other Hardware"],
    Glass: ["Sliding Partitions", "Shower Cubicles", "Mirrors", "Railing"],
    Facade: ["Elevation", "Double Height Lobby", "Highlighter Wall", "Washrooms", "Countertop"],
  };
  const departments = Object.keys(DEPARTMENT_WORKTYPE_MAP);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedWorkType, setSelectedWorkType] = useState("");

  const currentWorkTypes = selectedDepartment ? DEPARTMENT_WORKTYPE_MAP[selectedDepartment] || [] : [];

  // Work types that should use auto-staging
  const AUTO_STAGE_WORK_TYPES = ["Carcass", "Base And Back", "Basic Hardware", "Other Hardware"];

  const [catalog, setCatalog] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [stagedItems, setStagedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Retry function for catalog loading
  const retryCatalogFetch = () => {
    if (!selectedCategory) {
      triggerPopup("Please select a category first", "red");
      return;
    }
    // Trigger the useEffect by toggling a dependency
    setCatalogError(false);
    setCatalogErrorMessage("");
    const adminToken = localStorage.getItem("adminToken");
    
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(false);
      setCatalogErrorMessage("");
      try {
        if (!backendUrl) {
          throw new Error("Backend URL not configured");
        }

        let url = `${backendUrl}/catelog/category/${encodeURIComponent(selectedCategory)}`;
        if (selectedWorkType) {
          url = `${backendUrl}/catelog/category/${encodeURIComponent(selectedCategory)}/workType/${encodeURIComponent(selectedWorkType)}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
        });
        
        if (!res.data) {
          throw new Error("No data received from catalog API");
        }
        
        let list = Array.isArray(res.data) ? res.data : [];

        // Client-side filter by department if selected
        if (selectedDepartment) {
          list = list.filter((it) => it.department === selectedDepartment);
        }

        if (list.length === 0) {
          setCatalogError(true);
          setCatalogErrorMessage("No catalog items found for the selected category and filters. Please contact admin to add items to the catalog.");
          triggerPopup("No catalog items available for selection", "red");
        } else {
          setCatalogError(false);
          setCatalogErrorMessage("");
          triggerPopup("Catalog loaded successfully!", "green");
        }
        
        setCatalog(list);
        setFilteredItems(list);
      } catch (err) {
        console.error("Catalog fetch error:", err);
        const errorMsg = err?.response?.status === 404 
          ? "Catalog not found for this category"
          : err?.response?.status === 500
          ? "Server error while fetching catalog"
          : err?.response?.data?.message || "Failed to fetch catalog items";
        
        setCatalogError(true);
        setCatalogErrorMessage(errorMsg);
        triggerPopup(errorMsg, "red");
        setCatalog([]);
        setFilteredItems([]);
      } finally {
        setCatalogLoading(false);
      }
    };
    
    fetchCatalog();
  };

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
        setSelectedCategory(cat);
      } catch (err) {
        console.error(err);
        triggerPopup("Failed to fetch project details", "red");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Fetch catalog when category, department, or workType selection changes
  useEffect(() => {
    if (!selectedCategory) return;
    const adminToken = localStorage.getItem("adminToken");

    const fetchCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(false);
      setCatalogErrorMessage("");
      try {
        if (!backendUrl) {
          throw new Error("Backend URL not configured");
        }

        let url = `${backendUrl}/catelog/category/${encodeURIComponent(selectedCategory)}`;
        if (selectedWorkType) {
          url = `${backendUrl}/catelog/category/${encodeURIComponent(selectedCategory)}/workType/${encodeURIComponent(selectedWorkType)}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
        });
        
        if (!res.data) {
          throw new Error("No data received from catalog API");
        }
        
        let list = Array.isArray(res.data) ? res.data : [];

        // Client-side filter by department if selected
        if (selectedDepartment) {
          list = list.filter((it) => it.department === selectedDepartment);
        }

        if (list.length === 0) {
          setCatalogError(true);
          setCatalogErrorMessage("No catalog items found for the selected category and filters. Please contact admin to add items to the catalog.");
          triggerPopup("No catalog items available for selection", "red");
        } else {
          setCatalogError(false);
          setCatalogErrorMessage("");
        }
        
        setCatalog(list);
        setFilteredItems(list);
      } catch (err) {
        console.error("Catalog fetch error:", err);
        const errorMsg = err?.response?.status === 404 
          ? "Catalog not found for this category"
          : err?.response?.status === 500
          ? "Server error while fetching catalog"
          : err?.response?.data?.message || "Failed to fetch catalog items";
        
        setCatalogError(true);
        setCatalogErrorMessage(errorMsg);
        triggerPopup(errorMsg, "red");
        setCatalog([]);
        setFilteredItems([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory, selectedDepartment, selectedWorkType]);

  // Auto-stage all filtered items when workType is selected (only for specific work types)
  useEffect(() => {
    // Only auto-stage if workType is selected, not empty, and in AUTO_STAGE_WORK_TYPES
    if (!selectedWorkType || !AUTO_STAGE_WORK_TYPES.includes(selectedWorkType) || filteredItems.length === 0) return;

    // Filter items to only include those matching the selected workType
    const staged = filteredItems
      .filter((item) => item.workType === selectedWorkType)
      .map((item, idx) => ({
        id: item._id || `${item.name}-${idx}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        totalPrice: Number(item.price || 0),
        imageLink: item.imageLink,
        department: item.department,
        workType: item.workType,
      }));

    // Guard: if no items match after filtering, don't stage anything
    if (staged.length === 0) return;

    // Merge newly staged items with existing ones, avoid duplicates by name
    setStagedItems((prev) => {
      const merged = new Map();
      prev.forEach((it) => merged.set(it.name, it));
      staged.forEach((it) => {
        if (!merged.has(it.name)) {
          merged.set(it.name, it);
        }
      });
      return Array.from(merged.values());
    });
  }, [selectedWorkType, filteredItems]);

  const handleRemoveStaged = (id) => {
    setStagedItems(stagedItems.filter((it) => it.id !== id));
  };

  // Add a single item to staged items (for manual selection)
  const handleAddToStaged = (item) => {
    const stagedItem = {
      id: item._id || `${item.name}-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity: 1,
      totalPrice: Number(item.price || 0),
      imageLink: item.imageLink,
      department: item.department,
      workType: item.workType,
    };

    setStagedItems((prev) => {
      // Check if item already exists by name
      const exists = prev.some((it) => it.name === item.name);
      if (exists) {
        triggerPopup("This item is already staged", "orange");
        return prev;
      }
      return [...prev, stagedItem];
    });
  };

  // Allow editing quantity for staged items and keep totals in sync
  const handleQuantityChange = (id, value) => {
    // Allow empty string while user edits; clamp to min 0.1 when a number is provided
    if (value === "") {
      setStagedItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                quantity: "",
                totalPrice: 0,
              }
            : it
        )
      );
      return;
    }

    const qty = Math.max(0.1, Number(value) || 0);
    setStagedItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              quantity: qty,
              totalPrice: qty * Number(it.price || 0),
            }
          : it
      )
    );
  };

  const [discountPercent, setDiscountPercent] = useState(0);
  const [freightInstallationHandling, setFreightInstallationHandling] =
    useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const [includeTax, setIncludeTax] = useState(true);
  const handleSubmit = async () => {
    if (catalogError) {
      return triggerPopup("Cannot submit quotation: Catalog items failed to load. Please retry loading catalog items.", "red");
    }
    if (catalog.length === 0) {
      return triggerPopup("Cannot submit quotation: No catalog items are available. Please contact admin.", "red");
    }
    if (stagedItems.length === 0) {
      return triggerPopup("Add at least one item", "red");
    }
    try {
      setIsLoading(true);
      const grossAmount = stagedItems.reduce(
        (s, it) => s + (Number(it.totalPrice) || 0),
        0
      );
      const totalBeforeDiscount = grossAmount ;
      const discountAmount = (Number(discountPercent || 0) / 100) * totalBeforeDiscount;
      const totalBeforeTax = totalBeforeDiscount + freightInstallationHandling- discountAmount;
      const taxAmount = includeTax
        ? (Number(taxPercent || 0) / 100) * totalBeforeTax
        : 0;
      const grandTotal = totalBeforeTax + taxAmount;

      const payload = {
        projectId,
        category: selectedCategory,
        items: stagedItems.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          totalPrice: it.totalPrice,
          department: it.department,
          workType: it.workType,
        })),
        totals: {
          grossAmount,
          discountPercent: Number(discountPercent || 0),
          discountAmount,
          taxAmount,
          freightInstallationHandling: Number(freightInstallationHandling || 0),
          grandTotal,
        },
      };
      const res = await axios.post(`${backendUrl}/quotation`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      triggerPopup("Quotation created", "green");
      setStagedItems([]);
      setTimeout(
        () => router.push(`/admin/projects/${projectId}/quotation`),
        1200
      );
    } catch (err) {
      console.error(err);
      triggerPopup(
        err?.response?.data?.message || "Failed to create quotation",
        "red"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`/* minimal local styles to match admin theme */
        .input-styled{padding:10px;border-radius:8px;border:1px solid #e9e6e3}
        .btn-primary{background:#e07b63;color:#fff;padding:10px 16px;border-radius:8px}
        .card{background:#fff;padding:16px;border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.06);}
        .card-header{font-size:16px;font-weight:600;margin-bottom:8px}
        .staged-item{background:#fafafa;padding:12px;border-radius:8px}
        .muted{color:#888;font-size:13px}
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        .no-spinner{-moz-appearance:textfield}
      `}</style>
      <div style={{ padding: 20 }}>
        {showPopup && (
          <Popup
            message={popupMessage}
            color={popupColor}
            onClose={() => setShowPopup(false)}
          />
        )}

        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Create Quotation</h1>

        <div style={{ display: "flex", gap: 20 }}>
          <div className="card" style={{ flex: 1 }}>
            <h2 className="card-header">Catalog & Filters</h2>

            {/* Catalog Error Display */}
            {catalogError && (
              <div style={{ 
                background: "#fee2e2", 
                border: "1px solid #fecaca", 
                borderRadius: "8px", 
                padding: "12px", 
                marginBottom: "16px" 
              }}>
                <div style={{ color: "#dc2626", fontWeight: "600", marginBottom: "8px" }}>
                  Catalog Loading Error
                </div>
                <div style={{ color: "#dc2626", fontSize: "14px", marginBottom: "12px" }}>
                  {catalogErrorMessage}
                </div>
                <button 
                  onClick={retryCatalogFetch}
                  disabled={catalogLoading}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: catalogLoading ? "not-allowed" : "pointer",
                    opacity: catalogLoading ? 0.6 : 1
                  }}
                >
                  {catalogLoading ? "Retrying..." : "Retry"}
                </button>
              </div>
            )}

            {/* Catalog Loading Indicator */}
            {catalogLoading && (
              <div style={{ 
                background: "#eff6ff", 
                border: "1px solid #dbeafe", 
                borderRadius: "8px", 
                padding: "12px", 
                marginBottom: "16px",
                textAlign: "center" 
              }}>
                <div style={{ color: "#2563eb" }}>Loading catalog items...</div>
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12 }}>Category</label>
              <select
                className="input-styled w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12 }}>Department</label>
              <select
                className="input-styled w-full"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedWorkType("");
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {selectedDepartment && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12 }}>Work Type</label>
                <select
                  className="input-styled w-full"
                  value={selectedWorkType}
                  onChange={(e) => {
                    setSelectedWorkType(e.target.value);
                    setSearchTerm("");
                  }}
                >
                  <option value="">All Work Types</option>
                  {currentWorkTypes.map((wt) => (
                    <option key={wt} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12 }}>Items</label>
              {isLoading ? (
                <div style={{ padding: 8 }}>
                  <LoadingSpinner />
                </div>
              ) : !selectedWorkType ? (
                <div style={{ color: "#666", fontSize: 13 }}>
                  Select a department and work type to view items.
                </div>
              ) : AUTO_STAGE_WORK_TYPES.includes(selectedWorkType) ? (
                <div style={{ color: "#666", fontSize: 13 }}>
                  All matching items auto-staged with quantity 1.
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="input-styled w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: "grid", gap: 10, maxHeight: "400px", overflowY: "auto" }}>
                    {filteredItems
                      .filter((item) =>
                        item.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .length === 0 ? (
                      <div style={{ color: "#888", fontSize: 13 }}>
                        {filteredItems.length === 0
                          ? "No items available"
                          : "No items match your search"}
                      </div>
                    ) : (
                      filteredItems
                        .filter((item) =>
                          item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "10px",
                          background: "#f5f5f5",
                          borderRadius: "6px",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                          <img
                            src={item.imageLink}
                            alt={item.name}
                            style={{
                              width: 60,
                              height: 45,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>₹{item.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToStaged(item)}
                          style={{
                            background: "#e07b63",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ flex: 2 }}>
            <h2 className="card-header">Staged Items ({stagedItems.length})</h2>
            {stagedItems.length === 0 ? (
              <div style={{ color: "#888" }}>
                No items staged. Use the left panel to add items and quantity.
              </div>
            ) : (
              <ul style={{ display: "grid", gap: 10 }}>
                {stagedItems.map((it) => (
                  <li
                    key={it.id}
                    className="staged-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <img
                        src={it.imageLink}
                        alt={it.name}
                        style={{
                          width: 80,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {it.workType}
                        </div>
                        <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                          <span>Qty:</span>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            className="input-styled"
                            style={{ width: 90 }}
                            value={it.quantity}
                            onChange={(e) => handleQuantityChange(it.id, e.target.value)}
                            onFocus={() => handleQuantityChange(it.id, "")}
                            onBlur={(e) => handleQuantityChange(it.id, e.target.value || "0.1")}
                          />
                          <span>× ₹{it.price} =</span>
                          <strong>₹{it.totalPrice}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleRemoveStaged(it.id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          padding: "8px 10px",
                          borderRadius: 6,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Calculations and inputs */}
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ width: 160, alignSelf: "center" }}>
                  Discount (%)
                </label>
                <input
                  type="number"
                  className="input-styled no-spinner"
                  style={{ width: 80 }}
                  value={discountPercent === 0 ? "" : discountPercent}
                  onFocus={() => discountPercent === 0 && setDiscountPercent("")}
                  onBlur={(e) =>
                    setDiscountPercent(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  onChange={(e) =>
                    setDiscountPercent(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                <span style={{ fontSize: 13, color: "#666" }}>
                  ₹{((Number(discountPercent || 0) / 100) * (stagedItems.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0))).toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ width: 160, alignSelf: "center" }}>
                  Handling charges (₹)
                </label>
                <input
                  type="number"
              
                  className="input-styled no-spinner"
                  value={
                    freightInstallationHandling === 0
                      ? ""
                      : freightInstallationHandling
                  }
                  onFocus={() =>
                    freightInstallationHandling === 0 &&
                    setFreightInstallationHandling("")
                  }
                  onBlur={(e) =>
                    setFreightInstallationHandling(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  onChange={(e) =>
                    setFreightInstallationHandling(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ width: 160 }}>
                  Tax (%)
                </label>
                <input
                  type="number"
                  className="input-styled"
                  value={taxPercent === 0 ? "" : taxPercent}
                  onFocus={() => taxPercent === 0 && setTaxPercent("")}
                  onBlur={(e) =>
                    setTaxPercent(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  onChange={(e) =>
                    setTaxPercent(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  disabled={!includeTax}
                />
                <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(e) => setIncludeTax(e.target.checked)}
                  />
                  Apply tax
                </label>
              </div>

              {/* live summary H2s */}
              <div className="flex flex-col gap-2 mt-4 border-t pt-4 border-gray-200 text-sm font-medium text-gray-500">
                {(() => {
                  const gross = stagedItems.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
                  const discountAmount = (Number(discountPercent || 0) / 100) * gross;
                  const afterDiscount = gross - discountAmount;
                  const beforeTax = afterDiscount + Number(freightInstallationHandling || 0);
                  const taxAmount = includeTax ? (Number(taxPercent || 0) / 100) * beforeTax : 0;
                  const total = beforeTax + taxAmount;
                  
                  return (
                    <>
                      <h1 className="text-xl">
                        Gross: ₹{gross.toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl">
                        Discount: {discountPercent}% - ₹{discountAmount.toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl">
                        After Discount: ₹{afterDiscount.toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl">
                        Handling charges: ₹{Number(freightInstallationHandling || 0).toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl">
                        Total Before Tax: ₹{beforeTax.toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl">
                        Tax: ₹{taxAmount.toLocaleString("en-IN")}
                      </h1>
                      <h1 className="text-xl" style={{ fontWeight: "bold" }}>
                        Total: ₹{total.toLocaleString("en-IN")}
                      </h1>
                    </>
                  );
                })()}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || stagedItems.length === 0 || catalogError || (catalog.length === 0)}
                style={{
                  opacity: (catalogError || (catalog.length === 0 && !catalogLoading)) ? 0.5 : 1,
                  cursor: (catalogError || (catalog.length === 0 && !catalogLoading)) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
