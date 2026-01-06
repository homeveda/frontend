"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../../component/loadingSpinner";
import Popup from "../../../../../../component/popup";
import axios from "axios";
import { number } from "framer-motion";

export default function QuotationPage() {
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

  // Work type groups and optional subtypes
  const workGroups = {
    "Wood Work": ["Carcuass", "Shutters", "Visibles", "Base And Back"],
    Hardware: ["Main Hardware", "Other Hardware"],
    Countertop: [],
    Appliances: [],
    Miscellaneous: [],
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState("");
  const [selectedWorkSubtype, setSelectedWorkSubtype] = useState("");

  const [catalog, setCatalog] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [stagedItems, setStagedItems] = useState([]);

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

  // Fetch catalog when category or workType selection changes
  useEffect(() => {
    if (!selectedCategory) return;
    const adminToken = localStorage.getItem("adminToken");

    const fetchByWorkType = async (workType) => {
      try {
        const res = await axios.get(
          `${backendUrl}/catelog/category/${encodeURIComponent(
            selectedCategory
          )}/workType/${encodeURIComponent(workType)}`,
          {
            headers: {
              Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            },
          }
        );
        return res.data || [];
      } catch (err) {
        return null; // signal fallback
      }
    };

    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        // If a subtype is selected, try fetching by that exact workType first
        if (selectedWorkSubtype) {
          const r = await fetchByWorkType(selectedWorkSubtype);
          if (r && Array.isArray(r)) {
            setCatalog(r);
            setFilteredItems(r);
            return;
          }
        }

        // If a work group is selected, try fetching by it
        if (selectedWorkGroup) {
          const r = await fetchByWorkType(selectedWorkGroup);
          if (r && Array.isArray(r)) {
            setCatalog(r);
            setFilteredItems(r);
            return;
          }
        }

        // Fallback: fetch all by category and filter client-side
        const resp = await axios.get(
          `${backendUrl}/catelog/category/${encodeURIComponent(
            selectedCategory
          )}`,
          {
            headers: {
              Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
            },
          }
        );
        const list = resp.data || [];
        let filtered = list;
        if (selectedWorkGroup) {
          const sub = selectedWorkSubtype || selectedWorkGroup;
          filtered = list.filter((it) =>
            (it.workType || "").toLowerCase().includes(sub.toLowerCase())
          );
        }
        setCatalog(list);
        setFilteredItems(filtered);
      } catch (err) {
        console.error(err);
        triggerPopup("Failed to fetch catalog", "red");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory, selectedWorkGroup, selectedWorkSubtype]);

  useEffect(() => {
    if (!selectedItemName) return setSelectedItem(null);
    const found = filteredItems.find((i) => i.name === selectedItemName);
    setSelectedItem(found || null);
    if (found) setQuantity(1);
  }, [selectedItemName, filteredItems]);

  const handleStage = () => {
    if (!selectedItem) return triggerPopup("Select an item to add.", "red");
    if (!quantity || Number(quantity) <= 0)
      return triggerPopup("Quantity must be at least 1", "red");

    const newItem = {
      id: Date.now(),
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: Number(quantity),
      totalPrice: Number(quantity) * Number(selectedItem.price || 0),
      imageLink: selectedItem.imageLink,
      workType: selectedItem.workType,
    };
    setStagedItems([...stagedItems, newItem]);
    setSelectedItemName("");
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleRemoveStaged = (id) => {
    setStagedItems(stagedItems.filter((it) => it.id !== id));
  };

  const [discount, setDiscount] = useState(0);
  const [freightInstallationHandling, setFreightInstallationHandling] =
    useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const handleSubmit = async () => {
    if (stagedItems.length === 0)
      return triggerPopup("Add at least one item", "red");
    try {
      setIsLoading(true);
      const grossAmount = stagedItems.reduce(
        (s, it) => s + (Number(it.totalPrice) || 0),
        0
      );
      const totalBeforeTax =
        grossAmount -
        Number(discount || 0) +
        Number(freightInstallationHandling || 0);
      const taxAmount = (Number(taxPercent || 0) / 100) * totalBeforeTax;
      const grandTotal =
        grossAmount -
        Number(discount || 0) +
        Number(freightInstallationHandling || 0) +
        taxAmount;

      const payload = {
        projectId,
        category: selectedCategory,
        items: stagedItems.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          totalPrice: it.totalPrice,
          workType: it.workType,
        })),
        totals: {
          grossAmount,
          discount: Number(discount || 0),
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
              <label style={{ fontSize: 12 }}>Work Group</label>
              <select
                className="input-styled w-full"
                value={selectedWorkGroup}
                onChange={(e) => {
                  setSelectedWorkGroup(e.target.value);
                  setSelectedWorkSubtype("");
                }}
              >
                <option value="">All</option>
                {Object.keys(workGroups).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {selectedWorkGroup &&
              workGroups[selectedWorkGroup] &&
              workGroups[selectedWorkGroup].length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12 }}>Subtype</label>
                  <select
                    className="input-styled w-full"
                    value={selectedWorkSubtype}
                    onChange={(e) => setSelectedWorkSubtype(e.target.value)}
                  >
                    <option value="">All</option>
                    {workGroups[selectedWorkGroup].map((s) => (
                      <option key={s} value={s}>
                        {s}
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
                        <img
                          src={selectedItem.imageLink}
                          alt={selectedItem.name}
                          style={{
                            width: 120,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
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
                          min={1}
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
                        <div style={{ marginTop: 6 }}>
                          Qty: {it.quantity} × ₹{it.price} ={" "}
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
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ width: 160, alignSelf: "center" }}>
                  Discount (₹)
                </label>
                <input
                  type="number"
                  className="input-styled"
                  value={discount === 0 ? "" : discount}
                  onFocus={() => discount === 0 && setDiscount("")}
                  onBlur={(e) =>
                    setDiscount(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  onChange={(e) =>
                    setDiscount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ width: 160, alignSelf: "center" }}>
                  Freight / Installation (₹)
                </label>
                <input
                  type="number"
              
                  className="input-styled"
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

              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ width: 160, alignSelf: "center" }}>
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
                />
              </div>

              {/* live summary H2s */}
              <div className="flex flex-col gap-2 mt-4 border-t pt-4 border-gray-200 text-sm font-medium text-gray-500">
                <h1 className="text-xl">
                  Gross: ₹
                  {stagedItems
                    .reduce((s, it) => s + (Number(it.totalPrice) || 0), 0)
                    .toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Tax: ₹
                  {(
                    (stagedItems.reduce(
                      (s, it) => s + (Number(it.totalPrice) || 0),
                      0
                    ) -
                      Number(discount || 0) +
                      Number(freightInstallationHandling || 0)) *
                      (Number(taxPercent || 0) / 100) || 0
                  ).toLocaleString("en-IN")}
                </h1>
                <h1 className="text-xl">
                  Total: ₹
                  {(
                    stagedItems.reduce(
                      (s, it) => s + (Number(it.totalPrice) || 0),
                      0
                    ) -
                      Number(discount || 0) +
                      Number(freightInstallationHandling || 0) +
                      (stagedItems.reduce(
                        (s, it) => s + (Number(it.totalPrice) || 0),
                        0
                      ) -
                        Number(discount || 0) +
                        Number(freightInstallationHandling || 0)) *
                        (Number(taxPercent || 0) / 100) || 0
                  ).toLocaleString("en-IN")}
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
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || stagedItems.length === 0}
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
