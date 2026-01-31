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
                .dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
                .dash-card{background:#fff;padding:24px;border-radius:16px;box-shadow:0 12px 32px rgba(15,23,42,0.06);border:1px solid #efe7e2;display:flex;flex-direction:column;justify-content:space-between;min-height:180px;transition:transform .18s ease,box-shadow .18s ease}
                .dash-card:hover,.dash-card:focus{transform:translateY(-6px);box-shadow:0 18px 40px rgba(15,23,42,0.09);outline:none}
                .dash-card:focus{box-shadow:0 18px 44px rgba(14,45,79,0.12);border-color:rgba(224,123,99,0.18)}
                .dash-card h3{margin:0 0 8px 0;font-size:20px;color:#111}
                .dash-card p{margin:0;color:#666;font-size:14px}
                .desc-panel{background:#ffffff;border-radius:10px;padding:12px;margin-top:14px;border:1px solid rgba(14,14,14,0.04);min-height:56px;display:flex;align-items:center}
                .dash-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;gap:16px;flex-wrap:wrap}
                .dash-header > div:first-child{flex:1}
                .dash-header h1{font-size:26px;margin:0;color:#111}
                .dash-header-sub{color:#8f8f8f;font-size:13px;margin-top:4px}
                .dash-back-btn{color:#e07b63;font-size:14px;font-weight:600;cursor:pointer;border:none;background:none;padding:0;text-decoration:none}

                @media (max-width:1024px){
                  .dash-grid{grid-template-columns:repeat(2,1fr);gap:16px}
                  .dash-card{padding:16px;min-height:160px}
                  .dash-card h3{font-size:18px}
                }

                @media (max-width:768px){
                  .dash-grid{grid-template-columns:1fr;gap:12px}
                  .dash-card{padding:12px;min-height:140px;border-radius:12px}
                  .dash-card h3{font-size:16px;margin-bottom:6px}
                  .dash-card p{font-size:12px}
                  .desc-panel{padding:8px;min-height:50px;margin-top:10px}
                  .dash-header{margin-bottom:14px}
                  .dash-header h1{font-size:22px}
                  .dash-header-sub{font-size:12px;margin-top:2px}
                  .dash-back-btn{font-size:13px}
                }

                @media (max-width:480px){
                  .dash-grid{gap:8px}
                  .dash-card{padding:10px;min-height:120px;border-radius:10px}
                  .dash-card h3{font-size:14px;margin-bottom:4px}
                  .dash-card p{font-size:11px}
                  .desc-panel{padding:6px;min-height:45px;margin-top:8px;font-size:10px}
                  .dash-header{margin-bottom:12px;gap:8px}
                  .dash-header > div:first-child{width:100%}
                  .dash-header h1{font-size:18px}
                  .dash-header-sub{font-size:11px}
                  .dash-back-btn{font-size:12px;padding:4px}
                }

                @media (max-width:360px){
                  .dash-card{padding:8px;border-radius:8px}
                  .dash-card h3{font-size:13px}
                  .dash-card p{font-size:10px}
                  .dash-header h1{font-size:16px}
                }
                `}</style>

                <div className="max-w-7xl mx-auto">
                <div className="dash-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <div className="dash-header-sub">Quick access to common admin areas</div>
                    </div>
                    <div>
                        <button onClick={() => router.back()} className="dash-back-btn">← Back</button>
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