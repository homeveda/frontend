"use client";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();

    const cards = [
        {
            key: "initialLead",
            title: "Initial Leads",
            desc: "View and manage incoming leads.",
            href: "/admin/initiallead/",
            bg: "#fef2f0",
        },
        {
            key: "users",
            title: "Users",
            desc: "Add, edit and manage users and their projects.",
            href: "/admin/users",
            bg: "#fff7ed",
        },
        {
            key: "catelog",
            title: "Catelog",
            desc: "Browse,update and add catalog items.",
            href: "/admin/catelog/display",
            bg: "#f0fdf4",
        },
    ];

    return (
        <div
            className="p-6"
            style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}
        >
                <style>{`
                .dash-grid{display:grid;grid-template-columns:1fr;gap:20px}
                @media(min-width:640px){.dash-grid{grid-template-columns:repeat(2,1fr)}}
                @media(min-width:1024px){.dash-grid{grid-template-columns:repeat(3,1fr)}}
                .dash-card{background:#fff;padding:24px;border-radius:16px;box-shadow:0 12px 32px rgba(15,23,42,0.06);border:1px solid #efe7e2;display:flex;flex-direction:column;justify-content:space-between;min-height:180px;transition:transform .18s ease,box-shadow .18s ease}
                .dash-card:hover,.dash-card:focus{transform:translateY(-6px);box-shadow:0 18px 40px rgba(15,23,42,0.09);outline: none}
                .dash-card:focus{box-shadow:0 18px 44px rgba(14,45,79,0.12);border-color:rgba(224,123,99,0.18)}
                .dash-card h3{margin:0 0 8px 0;font-size:20px;color:#111}
                .dash-card p{margin:0;color:#666;font-size:14px}
                .desc-panel{background:#ffffff;border-radius:10px;padding:12px;margin-top:14px;border:1px solid rgba(14,14,14,0.04);min-height:56px;display:flex;align-items:center}
                `}</style>

                <div className="max-w-7xl mx-auto">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                        <h1 style={{ fontSize: 26, margin: 0, color: "#111" }}>Admin Dashboard</h1>
                        <div style={{ color: "#8f8f8f", fontSize: 13 }}>Quick access to common admin areas</div>
                    </div>
                    <div>
                        <button onClick={() => router.back()} className="text-sm font-semibold mb-4" style={{ color: '#e07b63' }}>← Back</button>
                    </div>
                </div>

                <div className="dash-grid">
                    {cards.map((c) => (
                        <div
                            key={c.key}
                            className="dash-card"
                            style={{ background: c.bg, cursor: 'pointer' }}
                            role="button"
                            tabIndex={0}
                            onClick={() => router.push(c.href)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') router.push(c.href);
                            }}
                            aria-label={`Open ${c.title}`}
                        >
                            <div>
                                <h3>{c.title}</h3>
                                <div className="desc-panel">
                                    <p style={{ margin: 0 }}>{c.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}