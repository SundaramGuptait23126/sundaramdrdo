import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Leaflet icon fix
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const cityCoords: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Pune: [18.5204, 73.8567],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
  Goa: [15.2993, 74.1240],
  Gurugram: [28.4595, 77.0266],
  Noida: [28.5355, 77.391],
};

function LocationMarker({ position, setPosition }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  
  // Update map center when position explicitly changes via dropdown
  import("react").then((React) => {
    React.useEffect(() => {
      if (position) {
        map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 1 });
      }
    }, [position.lat, position.lng, map]);
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

type ListingType = Database["public"]["Enums"]["listing_type"];
type PropertyType = Database["public"]["Enums"]["property_type"];
type FurnishingStatus = Database["public"]["Enums"]["furnishing_status"];

const cities = ["Mumbai", "Bangalore", "Gurugram", "Pune", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Goa", "Noida", "Ahmedabad"];

const PostProperty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    listing_type: "sale" as ListingType,
    price: "",
    deposit_amount: "",
    lease_duration_months: "",
    city: "",
    locality: "",
    address: "",
    property_type: "flat" as PropertyType,
    bhk: "",
    furnishing_status: "" as FurnishingStatus | "",
    area_sqft: "",
    amenities: "",
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777,
  });

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast({ title: "Max 5 images allowed", variant: "destructive" });
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }

    if (!form.title || !form.price || !form.city || !form.area_sqft) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in again.");

      // Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await fetch("https://apnaghar-gateway.onrender.com/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(`Image upload failed: ${uploadData.message}`);
        }
        imageUrls.push(uploadData.imageUrl);
      }

      const propertyData = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        location: form.city, // Backend expects location
        bhk: form.bhk ? Number(form.bhk) : 0,
        property_type: form.property_type,
        status: 'available',
        image_url: JSON.stringify(imageUrls), // Send as stringified array
        latitude: form.latitude,
        longitude: form.longitude
      };

      console.log("Submitting property:", propertyData);

      const res = await fetch("https://apnaghar-gateway.onrender.com/api/properties/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(propertyData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      console.log("Property created:", data);
      toast({ title: "Property Listed!", description: "Your property is now live." });
      navigate("/");
    } catch (err: any) {
      console.error("Post property error:", err);
      toast({ title: "Failed to post property", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-bold">Sign in to Post a Property</h2>
        <p className="mt-2 text-muted-foreground">You need an account to list properties.</p>
        <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Post a Property</h1>
      <p className="text-muted-foreground mb-8">Fill in the details to list your property on ApnaGhar.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Listing Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Listing Type *</label>
            <Select value={form.listing_type} onValueChange={(v) => updateForm("listing_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Property Type *</label>
            <Select value={form.property_type} onValueChange={(v) => updateForm("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat / Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title *</label>
          <Input
            placeholder="e.g., Spacious 3 BHK in Bandra West"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            required
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <Textarea
            placeholder="Describe your property in detail..."
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows={4}
            maxLength={2000}
          />
        </div>

        {/* Price & Rent Fields */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {form.listing_type === "rent" ? "Monthly Rent (₹) *" : "Price (₹) *"}
            </label>
            <Input
              type="number"
              placeholder="e.g., 15000000"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              required
              min={0}
            />
          </div>
          {form.listing_type === "rent" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Deposit (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g., 100000"
                  value={form.deposit_amount}
                  onChange={(e) => updateForm("deposit_amount", e.target.value)}
                  min={0}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Lease Duration (months)</label>
                <Input
                  type="number"
                  placeholder="e.g., 12"
                  value={form.lease_duration_months}
                  onChange={(e) => updateForm("lease_duration_months", e.target.value)}
                  min={1}
                />
              </div>
            </>
          )}
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">City *</label>
            <Select value={form.city} onValueChange={(v) => {
              updateForm("city", v);
              if (cityCoords[v]) {
                updateForm("latitude", cityCoords[v][0].toString());
                updateForm("longitude", cityCoords[v][1].toString());
              }
            }}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Locality</label>
            <Input placeholder="e.g., Bandra West" value={form.locality} onChange={(e) => updateForm("locality", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Address</label>
            <Input placeholder="Full address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
          </div>
          
          {/* Map Location */}
          <div className="col-span-full">
            <label className="mb-1.5 block text-sm font-medium">Pin exact location on Map *</label>
            <div className="h-[300px] w-full rounded-md overflow-hidden border relative z-0">
              <MapContainer center={[form.latitude, form.longitude]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                  position={{ lat: form.latitude, lng: form.longitude }} 
                  setPosition={(p: any) => { updateForm("latitude", p.lat); updateForm("longitude", p.lng); }} 
                />
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click on the map to place the pin for exact property location.</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">BHK</label>
            <Select value={form.bhk} onValueChange={(v) => updateForm("bhk", v)}>
              <SelectTrigger><SelectValue placeholder="BHK" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((b) => <SelectItem key={b} value={String(b)}>{b} BHK</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Area (sq.ft) *</label>
            <Input type="number" placeholder="e.g., 1200" value={form.area_sqft} onChange={(e) => updateForm("area_sqft", e.target.value)} required min={0} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Furnishing</label>
            <Select value={form.furnishing_status} onValueChange={(v) => updateForm("furnishing_status", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furnished">Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Amenities (comma-separated)</label>
          <Input placeholder="e.g., Swimming Pool, Gym, Parking" value={form.amenities} onChange={(e) => updateForm("amenities", e.target.value)} />
        </div>

        {/* Images */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Property Images (max 5)</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative h-24 w-32 overflow-hidden rounded-lg border">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {imageFiles.length < 5 && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors">
              <Upload className="h-4 w-4" />
              Upload Images
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</> : "Post Property"}
        </Button>
      </form>
    </div>
  );
};

export default PostProperty;
