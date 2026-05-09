import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Trash2, Edit, MapPin, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MyProperties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMyProperties();
  }, [user]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://apnaghar-gateway.onrender.com/api/properties/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties.map((p: any) => ({
          ...p,
          id: p._id,
          images: p.image_url ? JSON.parse(p.image_url) : []
        })));
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      toast({ title: "Failed to load properties", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property? This cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://apnaghar-gateway.onrender.com/api/properties/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Property deleted successfully" });
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({ title: "Failed to delete property", description: err.message, variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">My Properties</h1>
        <Button onClick={() => navigate("/post-property")}>Post New Property</Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No properties yet</h3>
          <p className="text-muted-foreground mb-4">You haven't listed any properties.</p>
          <Button onClick={() => navigate("/post-property")}>Post Your First Property</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                    <Building2 className="h-10 w-10 opacity-20" />
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground uppercase shadow-sm">
                  {property.property_type}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-display text-xl font-bold text-primary">₹{(property.price || 0).toLocaleString('en-IN')}</span>
                </div>
                <h3 className="mb-1 line-clamp-1 font-semibold text-lg">{property.title}</h3>
                <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{property.location}</span>
                </div>
                <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {property.bhk > 0 && (
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" /> <span>{property.bhk} BHK</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-auto pt-4 flex gap-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/properties/${property.id}`)}>
                    View
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 gap-1" onClick={() => handleDelete(property.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
