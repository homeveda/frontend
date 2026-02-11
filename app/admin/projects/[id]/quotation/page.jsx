"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../component/loadingSpinner";
import ConfirmationDialogueBox from "../../../../../component/confirmationDialogueBox";
import axios from "axios";

export default function QuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const groupByDepartmentAndWorkType = (items = []) => {
    const result = {};
    (items || []).forEach((it) => {
      if (!it) return;
      const dept = it.department || "Other";
      const wt = it.workType || "Uncategorized";
      if (!result[dept]) result[dept] = {};
      if (!result[dept][wt]) result[dept][wt] = [];
      result[dept][wt].push(it);
    });
    return result;
  };

  useEffect(() => {
    const adminToken =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getQuotations = async () => {
      try {
        const response = await axios.get(`${backendUrl}/quotation/${id}`, {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
          },
        });
        setQuotations(response.data.quotations || []);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    getQuotations();
  }, [id]);

  const handleOpenDelete = (qid) => {
    setToDeleteId(qid);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;
    setDeleting(true);
    try {
      const adminToken =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      await axios.delete(`${backendUrl}/quotation/${toDeleteId}`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : undefined,
        },
      });
      setQuotations((prev) => prev.filter((q) => q._id !== toDeleteId));
      setConfirmOpen(false);
      setToDeleteId(null);
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div
        className="p-6"
        style={{
          backgroundColor: "#f7f4f1",
          minHeight: "100vh",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <style>{`
        .quotation-table{width:100%;border-collapse:collapse;border:1px solid #cfcfcf}
        .quotation-table th,.quotation-table td{border:1px solid #cfcfcf;padding:8px;text-align:left}
        .quotation-table thead th{background:#e07b63;color:#fff;font-weight:700}
        .group-row td{background:#efefef;font-weight:600}
        .totals-box{border:1px solid #cfcfcf;padding:8px;width:320px}
      `}</style>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold" style={{ color: "#111111" }}>
              Project Quotations
            </h2>
            <div className="flex items-center gap-2 justify-center">
              {quotations.length === 0 && (
                <button
                  onClick={() => {
                    router.push(`/admin/projects/${id}/quotation/add`);
                  }}
                  className="bg-[#e07b63] text-white px-4 py-2 rounded hover:bg-[#f7f4f1] hover:text-[#e07b63] hover:border-[#e07b63] border rounded-lg border-transparent transition-colors"
                >
                  Add New Quotation
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

          {quotations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#8f8f8f] text-lg">No quotations found</p>
            </div>
          ) : (
            <div className="grid grid-row-1  gap-6 py-12">
              {quotations.map((quotation) => (
                <div
                  key={quotation._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {quotation.category || "Untitled Quotation"}
                    </h3>

                    <div className="space-y-3 mb-4 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Project ID:</span>{" "}
                        {quotation.projectId || id}
                      </p>
                      {quotation.siteAddress && (
                        <p>
                          <span className="font-semibold">Site Address:</span>{" "}
                          {quotation.siteAddress}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Category:</span>{" "}
                        {quotation.category || "-"}
                      </p>
                      {quotation.notes && (
                        <div className="mb-2 p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500 font-semibold">
                            Notes
                          </p>
                          <p className="text-sm text-gray-700">
                            {quotation.notes}
                          </p>
                        </div>
                      )}
                      x
                    </div>

                    {/* Items grouped by work-type in a bordered table (exclude Miscellaneous) */}
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">
                        Items Included
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <table className="quotation-table">
                            <thead>
                              <tr>
                                <th style={{ width: 80 }}>S.No.</th>
                                <th>Design and Finish</th>
                                <th style={{ width: 100 }}>Quantity</th>
                                <th style={{ width: 160 }}>Work Type</th>
                              </tr>
                            </thead>
                            {(() => {
                              const grouped = groupByDepartmentAndWorkType(
                                quotation.items || []
                              );
                              let serial = 1;
                              return Object.entries(grouped).map(
                                ([deptName, workTypes]) => {
                                  return (
                                    <tbody key={deptName}>
                                      <tr className="group-row">
                                        <td colSpan={4} style={{ fontWeight: 700, fontSize: 15 }}>{deptName}</td>
                                      </tr>
                                      {Object.entries(workTypes).map(
                                        ([workType, items]) => {
                                          if (!items || items.length === 0) return null;
                                          return items.map((it) => (
                                            <tr key={`${deptName}-${workType}-${serial}`}>
                                              <td>{serial++}</td>
                                              <td style={{ fontWeight: 600 }}>
                                                {it.name}
                                              </td>
                                              <td style={{ textAlign: "center" }}>
                                                {it.quantity || 0}
                                              </td>
                                              <td>{it.workType || "-"}</td>
                                            </tr>
                                          ));
                                        }
                                      )}
                                    </tbody>
                                  );
                                }
                              );
                            })()}
                          </table>
                        </div>

                        <div style={{ width: 320 }}>
                          <div className="totals-box">
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ padding: 6, fontWeight: 700 }}>
                                    Gross Amount
                                  </td>
                                  <td
                                    style={{ padding: 6, textAlign: "right" }}
                                  >
                                    ₹
                                    {quotation.totals?.grossAmount?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                </tr>
                                 <tr>
                                  <td style={{ padding: 6, fontWeight: 700 }}>
                                    Discount
                                  </td>
                                  <td
                                    style={{ padding: 6, textAlign: "right" }}
                                  >
                                    ₹
                                    {quotation.totals?.discount?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ padding: 6, fontWeight: 700 }}>
                                    Freight, Installation & Handling
                                  </td>
                                  <td
                                    style={{ padding: 6, textAlign: "right" }}
                                  >
                                    ₹
                                    {quotation.totals?.freightInstallationHandling?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                </tr>
                               
                                <tr>
                                  <td style={{ padding: 6, fontWeight: 700 }}>
                                    Total before Tax
                                  </td>
                                  <td
                                    style={{ padding: 6, textAlign: "right" }}
                                  >
                                    ₹
                                    {(
                                      (quotation.totals?.grossAmount || 0) +
                                      (quotation.totals
                                        ?.freightInstallationHandling || 0) -
                                      (quotation.totals?.discount || 0)
                                    ).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ padding: 6, fontWeight: 700 }}>
                                    Tax Amount
                                  </td>
                                  <td
                                    style={{ padding: 6, textAlign: "right" }}
                                  >
                                    ₹
                                    {quotation.totals?.taxAmount?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ padding: 6, fontWeight: 800 }}>
                                    Grand Total
                                  </td>
                                  <td
                                    style={{
                                      padding: 6,
                                      textAlign: "right",
                                      fontWeight: 800,
                                    }}
                                  >
                                    ₹
                                    {quotation.totals?.grandTotal?.toLocaleString(
                                      "en-IN"
                                    ) || 0}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          router.push(`/admin/projects/${id}/quotation/update`);
                        }}
                        className="flex-1 bg-[#e07b63] text-white text-center py-2 rounded hover:bg-[#d56a52] transition-colors text-sm font-medium"
                      >
                        Edit Quotation
                      </button>
                      <button
                        onClick={() => handleOpenDelete(quotation._id)}
                        disabled={deleting}
                        className="flex-1 bg-[#f7f4f1] border-[#e07b63] border text-[#e07b63] hover:text-[#f7f4f1] text-center py-2 rounded hover:bg-[#e07b63] transition-colors text-sm font-medium"
                      >
                        {deleting && toDeleteId === quotation._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmationDialogueBox
        open={confirmOpen}
        title="Delete quotation?"
        description="This will permanently delete the quotation. This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
