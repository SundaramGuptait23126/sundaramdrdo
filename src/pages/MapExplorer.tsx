import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { seedProperties, formatPrice, type Property } from "@/lib/mockData";
import { getPropertyImage } from "@/lib/stockImages";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createPriceIcon = (price: string, featured: boolean) => {
  return L.divIcon({
    className: "price-marker",
    html: `<div class="px-2 py-1 rounded-md text-xs font-bold shadow-md whitespace-nowrap ${
      featured ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
    }">${price}</div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 28],
  });
};

const cityCoords: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Pune: [18.5204, 73.8567],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Gurgaon: [28.4595, 77.0266],
  Noida: [28.5355, 77.391],
};

const getPropertyCoords = (p: Property): [number, number] => {
  if ((p as any).latitude && (p as any).longitude) return [(p as any).latitude, (p as any).longitude];
  const base = cityCoords[p.city] || [20.5937, 78.9629];
  const hash = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  // Keep markers within ~4km of city center
  return [base[0] + (hash % 100 - 50) * 0.0008, base[1] + ((hash * 7) % 100 - 50) * 0.0008];
};

// Auto-fly to city when filter changes
const FlyToCity = ({ city }: { city: string }) => {
  const map = useMap();
  useEffect(() => {
    if (city !== "all" && cityCoords[city]) {
      map.flyTo(cityCoords[city], 12, { duration: 1.2 });
    } else {
      map.flyTo([20.5937, 78.9629], 5, { duration: 1.2 });
    }
  }, [city, map]);
  return null;
};

const MapExplorer = () => {
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [listingType, setListingType] = useState<"all" | "sale" | "rent">("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [bhk, setBhk] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000000]);
  const [city, setCity] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch("https://apnaghar-gateway.onrender.com/api/map/properties");
        const data = await res.json();
        if (data.success) {
          setDbProperties(data.properties.map((p: any) => ({
            ...p,
            id: p._id,
            images: p.image_url ? JSON.parse(p.image_url) : [],
            amenities: p.amenities || [],
            listing_type: p.listing_type || 'sale',
            bhk: p.bhk || 0,
            city: p.location || 'Unknown'
          })));
        }
      } catch (err) {
        console.error("Error fetching map properties:", err);
      }
    };
    fetchProps();
  }, []);

  const allProperties = dbProperties;

  const cities = useMemo(() => {
    const set = new Set(allProperties.map((p) => p.city));
    return Array.from(set).sort();
  }, [allProperties]);

  const filtered = useMemo(() => {
    return allProperties.filter((p) => {
      if (listingType !== "all" && p.listing_type !== listingType) return false;
      if (propertyType !== "all" && p.property_type !== propertyType) return false;
      if (bhk !== "all" && p.bhk !== Number(bhk)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (city !== "all" && p.city !== city) return false;
      return true;
    });
  }, [allProperties, listingType, propertyType, bhk, priceRange, city]);

  const resetFilters = () => {
    setListingType("all");
    setPropertyType("all");
    setBhk("all");
    setPriceRange([0, 500000000]);
    setCity("all");
  };

  const activeFilterCount = [
    listingType !== "all",
    propertyType !== "all",
    bhk !== "all",
    priceRange[0] > 0 || priceRange[1] < 500000000,
    city !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Toolbar */}
      <div className="border-b bg-card px-4 py-2 flex items-center gap-3 shrink-0 flex-wrap">
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Map Explorer
        </h1>

        {/* Listing type toggle */}
        <div className="flex items-center gap-1 ml-2 rounded-lg border bg-background p-0.5">
          {(["all", "sale", "rent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setListingType(t)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                listingType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : t === "sale" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>

        {/* Quick filters - desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bhk} onValueChange={setBhk}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="BHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All BHK</SelectItem>
              {[1, 2, 3, 4, 5].map((b) => (
                <SelectItem key={b} value={String(b)}>{b} BHK</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 h-8 px-3 rounded-md border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors">
                Price <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <p className="text-sm font-semibold mb-3">Price Range</p>
              <Slider
                min={0}
                max={500000000}
                step={500000}
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-destructive hover:underline">
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Mobile filter button */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <button className="lg:hidden flex items-center gap-1 h-8 px-3 rounded-md border bg-background text-xs font-medium relative">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3">
            <p className="text-sm font-semibold">Filters</p>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bhk} onValueChange={setBhk}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="BHK" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All BHK</SelectItem>
                {[1, 2, 3, 4, 5].map((b) => <SelectItem key={b} value={String(b)}>{b} BHK</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Price Range</p>
              <Slider min={0} max={500000000} step={500000} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-destructive hover:underline">Clear all filters</button>
            )}
          </PopoverContent>
        </Popover>

        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} properties</span>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar list */}
        <div className="hidden md:flex flex-col w-80 border-r bg-card overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className={`flex gap-3 p-3 border-b text-left hover:bg-secondary/50 transition-colors ${
                selectedProperty?.id === p.id ? "bg-secondary" : ""
              }`}
            >
              <img
                src={getPropertyImage(p.images, p.property_type, 0)}
                alt={p.title}
                className="w-20 h-16 rounded-md object-cover shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">{p.locality}, {p.city}</p>
                <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(p.price)}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full z-0"
            scrollWheelZoom={true}
          >
            <FlyToCity city={city} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((p) => {
              const coords = getPropertyCoords(p);
              return (
                <Marker
                  key={p.id}
                  position={coords}
                  icon={createPriceIcon(formatPrice(p.price), p.featured)}
                  eventHandlers={{ click: () => setSelectedProperty(p) }}
                >
                  <Popup>
                    <div className="w-48">
                      <img src={getPropertyImage(p.images, p.property_type, 0)} alt={p.title} className="w-full h-24 object-cover rounded-md mb-2" />
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.locality}, {p.city}</p>
                      <p className="font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                      <Link to={`/property/${p.id}`} className="text-xs text-primary hover:underline mt-1 block">
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Selected property panel on mobile */}
          {selectedProperty && (
            <div className="absolute bottom-4 left-4 right-4 md:hidden bg-card rounded-xl shadow-elevated border p-3 z-[1000]">
              <button onClick={() => setSelectedProperty(null)} className="absolute top-2 right-2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex gap-3">
                <img src={getPropertyImage(selectedProperty.images, selectedProperty.property_type, 0)} alt="" className="w-20 h-16 rounded-md object-cover" />
                <div>
                  <p className="font-semibold text-sm">{selectedProperty.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedProperty.locality}, {selectedProperty.city}</p>
                  <p className="font-bold text-primary mt-0.5">{formatPrice(selectedProperty.price)}</p>
                  <Link to={`/property/${selectedProperty.id}`} className="text-xs text-primary hover:underline">View →</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
