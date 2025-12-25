"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../../../../component/loadingSpinner";
import axios from "axios";

export default function DesignPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getDesigns = async () => {
      try {
        const response = await axios.get(`${backendUrl}/designs/${id}`, {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : undefined
          }
        });
        setDesigns(response.data.designs);
      } catch (error) {
        console.error("Error fetching designs:", error);
      } finally {
        setLoading(false);
      }
    };

    getDesigns();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: '#f7f4f1', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-semibold" style={{ color: '#111111' }}>User Projects</h2>
        <button onClick={() => router.back()} className="text-xl font-semibold mb-4 cursor-pointer" style={{ color: "#e07b63" }}>← Back</button>
        </div>
        
        {designs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8f8f8f] text-lg">No designs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              design.items && design.items.map((item, index) => (
                <div 
                  key={`${design._id}-${index}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Design Image */}
                  {item.designLink && (
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={item.designLink}
                        alt={`${item.name} design`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Design+Image';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Design
                      </div>
                    </div>
                  )}

                  {/* Item Image */}
                  {item.imageLink && (
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={item.imageLink}
                        alt={`${item.name} image`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Item+Image';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Item
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.name || 'Untitled Item'}
                    </h3>
                    
                    <div className="flex gap-2 mt-4">
                      {item.designLink && (
                        <a
                          href={item.designLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          View Design
                        </a>
                      )}
                      {item.imageLink && (
                        <a
                          href={item.imageLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition-colors text-sm"
                        >
                          View Image
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ))}
          </div>
        )}
      </div>
    </div>
  );
}