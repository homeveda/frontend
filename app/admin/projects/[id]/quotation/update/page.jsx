"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";
import axios from "axios";
import { number } from "framer-motion";

export default function UpdateQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: projectId } = params;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const quotationIdFromUrl = searchParams.get("qid");

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

  // Validate backend URL on mount
  useEffect(() => {
    if (!backendUrl) {
      triggerPopup("Backend URL not configured", "red");
    }
  }, []);

  const [projectCategory, setProjectCategory] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const categories = ["Builder", "Economy", "Standard", "VedaX"];

  // Department -> WorkType mapping (matches backend catelogModel)
  const DEPARTMENT_WORKTYPE_MAP = {
    Kitchen: ["Carcass", "Shutters", "Visibles", "Base And Back", "Basic Hardware", "Additional Hardware", "Other Hardware", "Countertop", "Appliances"],
    Wardrobe: ["Carcass", "Shutters", "Base And Back", "Visibles", "Basic Hardware", "Additional Hardware", "Other Hardware"],
    Glass: ["Sliding Partitions", "Shower Cubicles", "Mirrors", "Railing"],
    Facade: ["Elevation", "Double Height Lobby", "Highlighter Wall", "Washrooms", "Countertop"],
  };
  const departmentsList = Object.keys(DEPARTMENT_WORKTYPE_MAP);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedWorkType, setSelectedWorkType] = useState("");

  const currentWorkTypes = selectedDepartment ? DEPARTMENT_WORKTYPE_MAP[selectedDepartment] || [] : [];

  const [catalog, setCatalog] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [stagedItems, setStagedItems] = useState([]);

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

  // Fetch existing quotation and project details
  useEffect(() => {
    if (!quotationIdFromUrl) return;
    
    const adminToken = localStorage.getItem("adminToken");
    const fetchProjectAndQuotation = async () => {
      try {
        setIsLoading(true);

        // Fetch project details
        const projectRes = await axios.get(
          `${backendUrl}/project/${projectId}`,
          {
            headers: {
              Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            },
          },
        );
        const cat = projectRes.data?.details?.category || "";
        setProjectCategory(cat);
        setSelectedCategory(cat);

        // Fetch the specific quotation by ID
        const quotationRes = await axios.get(
          `${backendUrl}/quotation/${projectId}`,
          {
            headers: {
              Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            },
          },
        );
        
        // Find the specific quotation from the list
        const quotation = quotationRes.data?.quotations?.find(q => q._id === quotationIdFromUrl);
        if (!quotation) {
          triggerPopup("Quotation not found", "red");
          return;
        }

        setQuotationId(quotation._id);

        // Load existing items into staged items
        if (quotation.items && Array.isArray(quotation.items)) {
          const loadedItems = quotation.items.map((it, index) => ({
            id: `${it._id || index}-${Date.now()}`,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            totalPrice: it.totalPrice,
            department: it.department,
            workType: it.workType,
          }));
          setStagedItems(loadedItems);
        }

        // Load totals if they exist
        if (quotation.totals) {
          setDiscountPercent(quotation.totals.discountPercent || 0);
          setFreightInstallationHandling(
            quotation.totals.freightInstallationHandling || 0,
          );
          setTaxPercent(quotation.totals.taxPercent || 18);
          // Check if tax was applied in the saved quotation
          setIncludeTax(quotation.totals.taxAmount > 0);
        }
      } catch (err) {
        console.error(err);
        triggerPopup("Failed to fetch quotation details", "red");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectAndQuotation();
  }, [projectId, quotationIdFromUrl]);

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

  useEffect(() => {
    if (!selectedItemName) return setSelectedItem(null);
    const found = filteredItems.find((i) => i.name === selectedItemName);
    setSelectedItem(found || null);
    if (found) setQuantity(1);
  }, [selectedItemName, filteredItems]);

  const handleStage = () => {
    if (!selectedItem) return triggerPopup("Select an item to add.", "red");
    if (!quantity || Number(quantity) < 0.1)
      return triggerPopup("Quantity must be at least 0.1", "red");

    // Check if item already exists in staged items
    const existingItemIndex = stagedItems.findIndex(
      (it) => it.name === selectedItem.name,
    );

    if (existingItemIndex !== -1) {
      // Item already exists, accumulate quantity
      const updatedItems = [...stagedItems];
      updatedItems[existingItemIndex].quantity += Number(quantity);
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].quantity *
        Number(updatedItems[existingItemIndex].price || 0);
      setStagedItems(updatedItems);
    } else {
      // New item, add it
      const newItem = {
        id: Date.now(),
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: Number(quantity),
        totalPrice: Number(quantity) * Number(selectedItem.price || 0),
        imageLink: selectedItem.imageLink,
        department: selectedItem.department,
        workType: selectedItem.workType,
      };
      setStagedItems([...stagedItems, newItem]);
    }
    setSelectedItemName("");
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleRemoveStaged = (id) => {
    setStagedItems(stagedItems.filter((it) => it.id !== id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    const numQty = Number(newQuantity);
    if (numQty < 0.1) return;

    const updatedItems = stagedItems.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          quantity: numQty,
          totalPrice: numQty * Number(it.price || 0),
        };
      }
      return it;
    });
    setStagedItems(updatedItems);
  };

  const [discountPercent, setDiscountPercent] = useState(0);
  const [freightInstallationHandling, setFreightInstallationHandling] =
    useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const [includeTax, setIncludeTax] = useState(true);
  // Derived amounts to show realtime calculations
  const [grossAmount, setGrossAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotalState, setGrandTotalState] = useState(0);
  const [totalBeforeTaxState, setTotalBeforeTaxState] = useState(0);

  // Recalculate totals whenever items or inputs change
  useEffect(() => {
    const gross = stagedItems.reduce(
      (s, it) => s + (Number(it.totalPrice) || 0),
      0,
    );
    setGrossAmount(gross);
    const totalBeforeDiscount = gross + Number(freightInstallationHandling || 0);
    const discountAmount = (Number(discountPercent || 0) / 100) * totalBeforeDiscount;
    const beforeTax = totalBeforeDiscount - discountAmount;
    setTotalBeforeTaxState(beforeTax);
    const tax = includeTax ? (Number(taxPercent || 0) / 100) * beforeTax : 0;
    setTaxAmount(tax);
    setGrandTotalState(beforeTax + tax);
  }, [
    stagedItems,
    discountPercent,
    freightInstallationHandling,
    taxPercent,
    includeTax,
  ]);

  const handleSubmit = async () => {
    if (catalogError) {
      return triggerPopup("Cannot update quotation: Catalog items failed to load. Please retry loading catalog items.", "red");
    }
    if (catalog.length === 0 && stagedItems.length === 0) {
      return triggerPopup("Cannot update quotation: No catalog items are available and no items are staged. Please contact admin.", "red");
    }
    if (stagedItems.length === 0) {
      return triggerPopup("Add at least one item", "red");
    }
    try {
      setIsLoading(true);
      // Use derived state values that are kept in sync via useEffect
      const gross = grossAmount;
      const totalBeforeDiscount = gross + Number(freightInstallationHandling || 0);
      const discountAmount = (Number(discountPercent || 0) / 100) * totalBeforeDiscount;
      const totalBeforeTax = totalBeforeTaxState;
      const taxAmt = taxAmount;
      const grandTotal = grandTotalState;
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
          grossAmount: gross,
          discountPercent: Number(discountPercent || 0),
          discountAmount,
          taxAmount: Number(taxAmt || 0),
          taxPercent: Number(taxPercent || 18),
          freightInstallationHandling: Number(freightInstallationHandling || 0),
          grandTotal: Number(grandTotal || 0),
        },
      };

      const res = await axios.patch(
        `${backendUrl}/quotation/${quotationId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      triggerPopup("Quotation updated successfully", "green");
      setTimeout(
        () => router.push(`/admin/projects/${projectId}/quotation`),
        1200,
      );
    } catch (err) {
      console.error(err);
      triggerPopup(
        err?.response?.data?.message || "Failed to update quotation",
        "red",
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
        <div className="flex items-center justify-between pb-4 mb-6 ">
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Update Quotation</h1>
          <button
            onClick={() => router.back()}
            className="text-xl font-semibold cursor-pointer"
            style={{ color: "#e07b63" }}
          >
            ← Back
          </button>
        </div>

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
                  ⚠️ Catalog Loading Error
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
                {departmentsList.map((d) => (
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
                  onChange={(e) => setSelectedWorkType(e.target.value)}
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
              ) : (
                <>
                  <select
                    className="input-styled w-full"
                    value={selectedItemName}
                    onChange={(e) => setSelectedItemName(e.target.value)}
                  >
                    <option value="">Select item</option>
                    {filteredItems.map((it) => (
                      <option key={it._id || it.name} value={it.name}>
                        {it.name} — ₹{it.price} ({it.type || it.workType || "—"}
                        )
                      </option>
                    ))}
                  </select>

                  {selectedItem && (
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {selectedItem.name}
                          </div>
                          <div style={{ color: "#888" }}>
                            {selectedItem.description}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <strong>₹{selectedItem.price}</strong>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="input-styled"
                          style={{ width: 120 }}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                        <button className="btn-primary" onClick={handleStage}>
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {it.workType}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <label style={{ fontSize: 12, color: "#666" }}>
                              Qty:
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              className="input-styled"
                              style={{
                                width: 60,
                                padding: "6px",
                                marginLeft: 4,
                              }}
                              value={it.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(it.id, e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              Price: ₹{it.price}
                            </div>
                            <div style={{ fontWeight: 600, marginTop: 2 }}>
                              Total: ₹{it.totalPrice}
                            </div>
                          </div>
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
                          cursor: "pointer",
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
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  onChange={(e) =>
                    setDiscountPercent(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
                <span style={{ fontSize: 13, color: "#666" }}>
                  ₹{((Number(discountPercent || 0) / 100) * (grossAmount + Number(freightInstallationHandling || 0))).toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ width: 160, alignSelf: "center" }}>
                  Freight / Installation (₹)
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
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  onChange={(e) =>
                    setFreightInstallationHandling(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ width: 160 }}>Tax (%)</label>
                <input
                  type="number"
                  className="input-styled"
                  value={taxPercent === 0 ? "" : taxPercent}
                  onFocus={() => taxPercent === 0 && setTaxPercent("")}
                  onBlur={(e) =>
                    setTaxPercent(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  onChange={(e) =>
                    setTaxPercent(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={!includeTax}
                />
                <label
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
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
                <h1 className="text-xl">
                  Gross: ₹{grossAmount.toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Freight/Installation: ₹{Number(freightInstallationHandling || 0).toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Total Before Discount: ₹{(grossAmount + Number(freightInstallationHandling || 0)).toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Discount: {discountPercent}% - ₹{((Number(discountPercent || 0) / 100) * (grossAmount + Number(freightInstallationHandling || 0))).toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Tax: ₹{(taxAmount || 0).toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl" style={{ fontWeight: "bold" }}>
                  Total: ₹{(grandTotalState || 0).toLocaleString("en-IN")}
                </h1>
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
                onClick={() => router.back()}
                style={{
                  background: "#888",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 8,
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || stagedItems.length === 0 || (catalogError && catalog.length === 0)}
                style={{
                  opacity: (catalogError && catalog.length === 0 && stagedItems.length === 0) ? 0.5 : 1,
                  cursor: (catalogError && catalog.length === 0 && stagedItems.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
