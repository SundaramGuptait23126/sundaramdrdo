import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, User, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Inquiry {
  _id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string;
  createdAt: string;
  property_id: {
    _id: string;
    title: string;
    location: string;
  } | null;
}

const Inquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://apnaghar-load-balancer.onrender.com/api/properties/inquiries", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setInquiries(data.inquiries);
        } else {
          setError(data.message || "Failed to load inquiries");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-display text-2xl font-bold">Please login to view inquiries</h2>
      </div>
    );
  }

  return (
    <div className="container py-8 min-h-[60vh]">
      <h1 className="font-display text-3xl font-bold mb-6">Property Inquiries (Leads)</h1>
      
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your inquiries...</div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center">{error}</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 bg-secondary rounded-xl">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-display text-xl font-medium mb-2">No Inquiries Yet</h3>
          <p className="text-muted-foreground">When someone is interested in your properties, their details will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inquiries.map((inq) => (
            <div key={inq._id} className="bg-card border border-border shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="mb-4 pb-4 border-b">
                <Link to={inq.property_id ? `/property/${inq.property_id._id}` : "#"} className="font-semibold text-primary hover:underline line-clamp-1">
                  {inq.property_id ? inq.property_id.title : "Deleted Property"}
                </Link>
                {inq.property_id && (
                  <p className="text-xs text-muted-foreground mt-1">{inq.property_id.location}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{inq.buyer_name}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${inq.buyer_phone}`} className="text-primary hover:underline">{inq.buyer_phone}</a>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Message:</p>
                  <p className="text-sm italic bg-secondary/50 p-2 rounded-md">"{inq.message}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inquiries;
