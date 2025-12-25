"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../../component/loadingSpinner";
import ProjectCard from "../../../component/projectCard";
import { useRouter,useSearchParams } from "next/navigation";

export default function UserProjectsPage(){
        const [email, setEmail] = useState("");
        const [projects, setProjects] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const router = useRouter();
        const searchParams = useSearchParams();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        useEffect(() => {
            const email = searchParams.get("userEmail") || "";
            setEmail(email);
            const fetchProjects = async () => {
                if(!backendUrl) return setError('Backend URL not configured');
                if(!email) return setError('Please enter user email');
                try{
                    setLoading(true);
                    setError(null);
                    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                    const res = await axios.get(`${backendUrl}/project/user?userEmail=${encodeURIComponent(email)}`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
                    const data = res.data?.projects || [];
                    setProjects(Array.isArray(data) ? data : []);
                }catch(err){
                    setError(err?.response?.data?.message || err.message || 'Failed to load projects');
                    setProjects([]);
                }finally{
                    setLoading(false);
                }
            };
            fetchProjects();
        }, [email, backendUrl]);

        return (
            <div className="p-6" style={{ backgroundColor: '#f7f4f1', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold" style={{ color: '#111111' }}>User Projects</h2>
                            <p className="text-xl mt-1" >Email id - <span className="text-[#8f8f8f]">{email}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => router.push(`/admin/projects/add?userEmail=${encodeURIComponent(email)}`)} className="text-white px-4 py-2 rounded-[10px] font-semibold transition" style={{ backgroundColor: '#e07b63' }} onMouseEnter={(e) => (e.target.style.backgroundColor = '#d56a52')} onMouseLeave={(e) => (e.target.style.backgroundColor = '#e07b63')}>Create New Project</button>
                        </div>
                    </div>

                    

                    {loading && <LoadingSpinner />}
                    {error && <div className="text-sm" style={{ color: '#e07b63' }}>{error}</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {projects.map(p => (
                            <div key={p.id || p._id}
                               
                                className="cursor-pointer"
                            >
                                <ProjectCard project={p} />
                            </div>
                        ))}
                    </div>

                    {!loading && projects.length === 0 && (
                        <div className="mt-6" style={{ color: '#8f8f8f' }}>No projects to display.</div>
                    )}
                </div>
            </div>
        );
}