"use client";
import React from "react";
import { motion } from "framer-motion";
import ConfirmationDialogueBox from "./confirmationDialogueBox";
import { useRouter } from "next/navigation";
export default function ProjectCard({ project }) {
  const p = project || {};
  const router = useRouter();
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="overflow-hidden bg-white flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      style={{
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(16,16,16,0.08)",
        border: "1px solid #e9e6e3",
      }}
    >
      <div
        className="p-4 "
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className="text-2xl font-semibold"
                style={{ color: "#111111" }}
              >
                Projects Head - {p.projectHead}{" "}
              </h3>
              {p.architectName && (
                <p className="text-xl mt-1 text-[#111111]">
                  Architect Name -{" "}
                  <span className="text-[#8f8f8f]"> {p.architectName}</span>
                </p>
              )}
              {p.category && (
                <p className=" mt-1 text-[#111111]">
                  Category -{" "}
                  <span className="text-[#e07b63]"> {p.category}</span>
                </p>
              )}

              {p.kitchen && (
                <div className=" mt-3">
                  <div>
                    <strong style={{ color: "#111111" }}>Kitchen:</strong>
                  </div>
                  <div>
                    Type:{" "}
                    <span className="text-[#8f8f8f]">
                      {p.kitchen.kitchenType}
                    </span>
                  </div>
                  <div>
                    Theme:{" "}
                    <span className="text-[#8f8f8f]">{p.kitchen.theme}</span>
                  </div>
                  {Array.isArray(p.kitchen.layoutPlan) &&
                    p.kitchen.layoutPlan.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {p.kitchen.layoutPlan.map((src) => (
                          <div
                            key={src}
                            className="w-full h-20 rounded-[8px] overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: "#f5f5f5" }}
                          >
                            <img
                              src={src}
                              alt="layout"
                              className="object-contain max-h-full max-w-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {p.wardrobe && (
                <div className=" mt-3" style={{ color: "#8f8f8f" }}>
                  <div>
                    <strong style={{ color: "#111111" }}>Wardrobe:</strong>
                  </div>
                  <div className="text-[#111111]">
                    Types:{" "}
                    <span className="text-[#8f8f8f]">
                      {" "}
                      {(p.wardrobe.type || []).join(", ")}
                    </span>
                  </div>
                  {Array.isArray(p.wardrobe.measureents) &&
                    p.wardrobe.measureents.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {p.wardrobe.measureents.map((src) => (
                          <div
                            key={src}
                            className="w-full h-20 rounded-[8px] overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: "#f5f5f5" }}
                          >
                            <img
                              src={src}
                              alt="measurement"
                              className="object-contain max-h-full max-w-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 content-between ">
          <button
            className="mt-4 text-white px-4 py-2 rounded-[10px] font-semibold transition"
            style={{ backgroundColor: "#e07b63" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/quotation`)
            }
          >
            Quotation
          </button>
          <button
            className="mt-4 text-white px-4 py-2 rounded-[10px] font-semibold transition"
            style={{ backgroundColor: "#e07b63" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/designs`)
            }
          >
            Designs
          </button>
          <button
            className="mt-4 text-white px-4 py-2 rounded-[10px] font-semibold transition"
            style={{ backgroundColor: "#e07b63" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
            onClick={() => {}}
          >
            Update Project
          </button>
          <button
            className="mt-4  text-white px-4 py-2 rounded-[10px] font-semibold transition bg-red-500 hover:bg-red-800"
            onClick={() => {}}
          >
            Delete Project
          </button>
        </div>
      </div>
    </motion.article>
  );
}
