import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, BedDouble, Maximize, Brain, TrendingUp, Eye, ArrowLeft,
  Phone, MessageCircle, CheckCircle, Share2, IndianRupee, Calendar, Sofa, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageGallery from "@/components/ImageGallery";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { seedProperties, formatPrice, formatArea, type Property } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [leadSent, setLeadSent] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch("/api/properties/all");
        const data = await res.json();
        
        if (data.success && data.properties) {
          const p = data.properties.find((prop: any) => (prop._id || prop.id).toString() === id);
          if (p) {
            const mapped: Property = {
              ...p,
              id: (p._id || p.id).toString(),
              title: p.title,
              price: Number(p.price) || 0,
              city: p.location,
              locality: p.location || "",
              property_type: p.property_type || "flat",
              bhk: p.bhk,
              listing_type: "sale",
              status: p.status,
              area_sqft: 0,
              images: p.image_url ? (() => {
                try {
                  const parsed = JSON.parse(p.image_url);
                  return Array.isArray(parsed) ? parsed : [p.image_url];
                } catch {
                  return [p.image_url];
                }
              })() : [],
              amenities: [],
              created_at: p.createdAt || p.created_at || new Date().toISOString()
            };
            setProperty(mapped);
            
            // Set similar properties
            const similarMapped = data.properties
              .filter((prop: any) => (prop._id || prop.id).toString() !== id && prop.location === p.location)
              .map((sp: any) => ({
                ...sp,
                id: (sp._id || sp.id).toString(),
                price: Number(sp.price) || 0,
                city: sp.location,
                locality: sp.location || "",
                property_type: sp.property_type || "flat",
                bhk: sp.bhk,
                listing_type: "sale",
                status: sp.status,
                area_sqft: 0,
                images: sp.image_url ? (() => {
                  try {
                    const parsed = JSON.parse(sp.image_url);
                    return Array.isArray(parsed) ? parsed : [sp.image_url];
                  } catch {
                    return [sp.image_url];
                  }
                })() : [],
                amenities: [],
                created_at: sp.createdAt || sp.created_at || new Date().toISOString()
              }));
              
            setSimilar(similarMapped.slice(0, 3));
          } else {
            // Fallback to seed data if not found in db
            const seed = seedProperties.find((sp) => sp.id === id);
            setProperty(seed || null);
            if (seed) setSimilar(seedProperties.filter((sp) => sp.id !== seed.id && (sp.city === seed.city || sp.property_type === seed.property_type)).slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Fetch property error:", err);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-display text-2xl font-bold">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block text-primary underline">Browse properties</Link>
      </div>
    );
  }

  const isRental = property.listing_type === "rent";
  const pricePerSqft = property.area_sqft > 0 ? Math.round(property.price / property.area_sqft) : null;

  const handleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property.id.startsWith("seed-")) {
      try {
        const res = await fetch("/api/properties/inquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_id: property.id,
            buyer_id: user?.id || null,
            buyer_name: leadForm.name,
            buyer_phone: leadForm.phone,
            message: leadForm.message
          })
        });
        const data = await res.json();
        if (data.success) {
          setLeadSent(true);
          toast({ title: "Inquiry Sent!", description: "The seller will get back to you soon." });
        } else {
          toast({ variant: "destructive", title: "Failed", description: data.message });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Could not send inquiry" });
      }
    } else {
      setLeadSent(true);
      toast({ title: "Inquiry Sent!", description: "The seller will get back to you soon." });
    }
  };

  return (
    <div className="container py-8">
      <Link to="/properties" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to properties
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery with lightbox */}
          <ImageGallery images={property.images} propertyType={property.property_type} title={property.title} />

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-accent text-accent-foreground border-0 capitalize">{property.property_type}</Badge>
                  <Badge className={`border-0 ${isRental ? "bg-success text-success-foreground" : "bg-ai text-ai-foreground"}`}>
                    {isRental ? "For Rent" : "For Sale"}
                  </Badge>
                  {property.featured && <Badge className="bg-warning text-warning-foreground border-0">⭐ Premium</Badge>}
                  <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3 text-success" /> Verified</Badge>
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">{property.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />{property.address}, {property.locality}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-foreground">
                  {formatPrice(property.price)}{isRental ? "/mo" : ""}
                </p>
                {pricePerSqft && !isRental && (
                  <p className="text-sm text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sq.ft</p>
                )}
                {property.predicted_price && (
                  <p className="flex items-center gap-1 text-sm text-ai justify-end">
                    <Brain className="h-3.5 w-3.5" />AI: {formatPrice(property.predicted_price)}{isRental ? "/mo" : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-secondary p-4">
              {property.bhk > 0 && (
                <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Bedrooms</p><p className="font-semibold">{property.bhk} BHK</p></div></div>
              )}
              <div className="flex items-center gap-2"><Maximize className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Area</p><p className="font-semibold">{formatArea(property.area_sqft)}</p></div></div>
              <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Views</p><p className="font-semibold">{property.views_count}</p></div></div>
              {property.ai_score && (
                <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-ai" /><div><p className="text-xs text-muted-foreground">AI Score</p><p className="font-semibold">{property.ai_score}%</p></div></div>
              )}
              {isRental && property.furnishing_status && (
                <div className="flex items-center gap-2"><Sofa className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Furnishing</p><p className="font-semibold capitalize">{property.furnishing_status}</p></div></div>
              )}
            </div>

            {isRental && (
              <div className="mt-4 flex flex-wrap gap-4 rounded-xl border p-4">
                {property.deposit_amount && <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Deposit</p><p className="font-semibold">{formatPrice(property.deposit_amount)}</p></div></div>}
                {property.lease_duration_months && <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Lease</p><p className="font-semibold">{property.lease_duration_months} months</p></div></div>}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="gap-1 px-3 py-1.5">
                  <CheckCircle className="h-3 w-3 text-success" />{a}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-card sticky top-24">
            <h3 className="font-display text-lg font-semibold mb-1">{isRental ? "Apply for Rent" : "Contact Seller"}</h3>
            <p className="text-sm text-muted-foreground mb-4">{isRental ? "Interested in renting? Send your details." : "Send an inquiry to the property owner."}</p>
            {leadSent ? (
              <div className="animate-scale-in rounded-lg bg-success/10 border border-success/20 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-semibold text-foreground">Inquiry Sent!</p>
                <p className="text-sm text-muted-foreground">The owner will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleLead} className="space-y-3">
                <Input placeholder="Your Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} required />
                <Input placeholder="Phone Number" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} required />
                <Textarea placeholder={isRental ? "I'd like to rent this property..." : "I'm interested in this property..."} value={leadForm.message} onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })} rows={3} />
                <Button type="submit" className="w-full gap-2"><MessageCircle className="h-4 w-4" />{isRental ? "Apply for Rent" : "Send Inquiry"}</Button>
                <Button type="button" variant="outline" className="w-full gap-2"><Phone className="h-4 w-4" />Call Owner</Button>
              </form>
            )}
            <Button variant="ghost" className="mt-3 w-full gap-2 text-muted-foreground"><Share2 className="h-4 w-4" />Share Property</Button>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
