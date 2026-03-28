"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import LoadingSpinner from "../../../component/loadingSpinner";
import ProjectCard from "../../../component/projectCard";
import { useRouter,useSearchParams } from "next/navigation";

function UserProjectsContent(){
        const [email, setEmail] = useState("");
        const [userInfo, setUserInfo] = useState(null);
        const [projects, setProjects] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const router = useRouter();
        const searchParams = useSearchParams();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        useEffect(() => {
            const email = searchParams.get("userEmail") || "";
            setEmail(email);
            const fetchData = async () => {
                if(!backendUrl) return setError('Backend URL not configured');
                if(!email) return setError('Please enter user email');
                try{
                    setLoading(true);
                    setError(null);
                    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                    
                    // Fetch user details
                    const userRes = await axios.get(`${backendUrl}/user/all`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
                    const users = userRes.data?.users || [];
                    const foundUser = users.find(u => u.email === email);
                    setUserInfo(foundUser || null);
                    
                    // Fetch projects
                    const projectRes = await axios.get(`${backendUrl}/project/user?userEmail=${encodeURIComponent(email)}`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
                    const data = projectRes.data?.projects || [];
                    setProjects(Array.isArray(data) ? data : []);
                }catch(err){
                    setError(err?.response?.data?.message || err.message || 'Failed to load data');
                    setProjects([]);
                    setUserInfo(null);
                }finally{
                    setLoading(false);
                }
            };
            fetchData();
        }, [email, backendUrl]);

        return (
            <div className="p-4 sm:p-6" style={{ backgroundColor: '#f7f4f1', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ color: '#111111' }}>User Projects</h2>
                        
                        {/* User Info Card */}
                        {userInfo && (
                            <div className="mb-4 rounded-lg overflow-hidden" style={{ 
                                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                                boxShadow: '0 10px 25px rgba(224,123,99,0.1)',
                                border: '1px solid rgba(224,123,99,0.15)'
                            }}>
                                {/* Header with accent */}
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #e07b63 0%, #d56a52 100%)',
                                    height: '3px'
                                }}></div>
                                
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#111111' }}>User Information</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                                        {/* Name Card */}
                                        <div style={{ 
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(224,123,99,0.06)',
                                            border: '1px solid rgba(224,123,99,0.1)'
                                        }}>
                                            <div style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '5px'
                                            }}>
                                                <span style={{ fontSize: '15px' }}>👤</span>
                                                <p style={{ fontSize: '10px', color: '#8f8f8f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>Name</p>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#111111', fontWeight: 700, margin: 0 }}>{userInfo.name || 'N/A'}</p>
                                        </div>

                                        {/* Email Card */}
                                        <div style={{ 
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(224,123,99,0.04)',
                                            border: '1px solid rgba(224,123,99,0.08)'
                                        }}>
                                            <div style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '5px'
                                            }}>
                                                <span style={{ fontSize: '15px' }}>✉️</span>
                                                <p style={{ fontSize: '10px', color: '#8f8f8f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>Email</p>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#111111', fontWeight: 600, margin: 0, wordBreak: 'break-all', lineHeight: '1.3' }}>{userInfo.email || 'N/A'}</p>
                                        </div>

                                        {/* Contact Card */}
                                        <div style={{ 
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(224,123,99,0.06)',
                                            border: '1px solid rgba(224,123,99,0.1)'
                                        }}>
                                            <div style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '5px'
                                            }}>
                                                <span style={{ fontSize: '15px' }}>📱</span>
                                                <p style={{ fontSize: '10px', color: '#8f8f8f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>Contact</p>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#111111', fontWeight: 700, margin: 0 }}>{userInfo.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    {userInfo.address && (
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(224,123,99,0.1)' }}>
                                            <div style={{ 
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px'
                                            }}>
                                                <span style={{ fontSize: '16px', marginTop: '1px', minWidth: '16px' }}>📍</span>
                                                <div>
                                                    <p style={{ fontSize: '10px', color: '#8f8f8f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0, marginBottom: '3px' }}>Address</p>
                                                    <p style={{ fontSize: '13px', color: '#111111', margin: 0, lineHeight: '1.4' }}>{userInfo.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-lg sm:text-xl font-semibold" style={{ color: '#111111' }}>Projects</h3>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <button onClick={() => router.push(`/admin/projects/add?userEmail=${encodeURIComponent(email)}`)} className="text-white px-3 sm:px-4 py-2 rounded-[10px] font-semibold transition text-sm sm:text-base whitespace-nowrap flex-1 sm:flex-none" style={{ backgroundColor: '#e07b63' }} onMouseEnter={(e) => (e.target.style.backgroundColor = '#d56a52')} onMouseLeave={(e) => (e.target.style.backgroundColor = '#e07b63')}>Create New Project</button>
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

export default function UserProjectsPage(){
        return (
                <Suspense fallback={<LoadingSpinner />}>
                        <UserProjectsContent />
                </Suspense>
        );
}