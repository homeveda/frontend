"use client";
import React from "react";

export default function ProjectTimeline({ status, onStepClick }) {
  // Define the full timeline of project statuses in order
  const timeline = [
    { key: "LEAD", label: "Lead", index: 0 },
    { key: "DESIGN", label: "Design", index: 1 },
    { key: "QUOTATION", label: "Quotation", index: 2 },
    { key: "10% TOKEN", label: "10% Token", index: 3 },
    { key: "FINAL MEASUREMENT", label: "Measurement", index: 4 },
    { key: "FINAL DRAWINGS", label: "Drawings", index: 5 },
    { key: "50% PAYMENT", label: "50% Payment", index: 6 },
    { key: "FACTORY ORDER", label: "Factory Order", index: 7 },
    { key: "SITE READY CHECK", label: "Site Ready", index: 8 },
    { key: "FACTORY FULL PAYMENT", label: "Full Payment", index: 9 },
    { key: "DISPATCH", label: "Dispatch", index: 10 },
    { key: "90% CLIENT PAYMENT", label: "90% Payment", index: 11 },
    { key: "INSTALLATION", label: "Installation", index: 12 },
    { key: "QUALITY CHECK", label: "Quality Check", index: 13 },
    { key: "HANDOVER", label: "Handover", index: 14 },
    { key: "10% FINAL PAYMENT", label: "Final Payment", index: 15 },
    { key: "AFTER SALES", label: "After Sales", index: 16 },
  ];

  // Find current status index
  const currentStatusIndex = timeline.findIndex((s) => s.key === status);

  // Determine color for each step: green (completed), yellow (current), gray (pending)
  const getStepColor = (index) => {
    if (index < currentStatusIndex) return "#10b981"; // green - completed
    if (index === currentStatusIndex) return "#f59e0b"; // yellow - current
    return "#d1d5db"; // gray - pending
  };

  const getStepBgColor = (index) => {
    if (index < currentStatusIndex) return "#dcfce7"; // light green
    if (index === currentStatusIndex) return "#fef3c7"; // light yellow
    return "#f3f4f6"; // light gray
  };

  // For better UX, show only a window of nearby steps (previous, current, next few)
  const showRange = 5; // Show 5 steps at a time
  const startIdx = Math.max(0, currentStatusIndex - 1);
  const endIdx = Math.min(timeline.length, startIdx + showRange);
  const visibleSteps = timeline.slice(startIdx, endIdx);

  const isClickable = typeof onStepClick === "function";

  return (
    <div className="w-full mt-4 px-2">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {visibleSteps.map((step, idx) => {
          const actualIndex = startIdx + idx;
          const color = getStepColor(actualIndex);
          const bgColor = getStepBgColor(actualIndex);
          const isCurrent = actualIndex === currentStatusIndex;

          return (
            <React.Fragment key={step.key}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white transition-all"
                  style={{
                    backgroundColor: color,
                    cursor: isClickable ? "pointer" : "default",
                    boxShadow: isCurrent
                      ? `0 0 0 3px ${color}40`
                      : "none",
                  }}
                  title={
                    isClickable
                      ? `Click to update status to "${step.label}"`
                      : step.label
                  }
                  onClick={(e) => {
                    if (isClickable) {
                      e.stopPropagation();
                      onStepClick(step.key, step.label);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.transform = "scale(1.2)";
                      e.currentTarget.style.boxShadow = `0 0 0 4px ${color}50`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = isCurrent
                        ? `0 0 0 3px ${color}40`
                        : "none";
                    }
                  }}
                >
                  {actualIndex + 1}
                </div>
                <div className="text-xs text-center mt-1 max-w-12" style={{ color: "#6b7280" }}>
                  {step.label}
                </div>
              </div>

              {/* Connector Line (only if not last step) */}
              {idx < visibleSteps.length - 1 && (
                <div
                  className="flex-1 h-1 mx-0.5"
                  style={{
                    backgroundColor:
                      actualIndex < currentStatusIndex ? "#10b981" : "#d1d5db",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Status Label */}
      <div className="mt-3 text-center text-xs sm:text-sm font-semibold" style={{ color: "#111111" }}>
        Current: <span style={{ color: "#f59e0b" }}>{status || "N/A"}</span>
      </div>
    </div>
  );
}
