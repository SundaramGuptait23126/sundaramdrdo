import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GitCompare, ArrowRight, X, Sparkles, Check, IndianRupee, MapPin, Building2, Brain, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/contexts/CompareContext";
import { seedProperties, formatPrice, formatArea } from "@/lib/mockData";
import { getPropertyImage } from "@/lib/stockImages";

interface ComparedPropertySpecs {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  bhk: number;
  property_type: string;
  status: string;
  images: string[];
  amenities: string[];
  area_sqft: number;
  price_per_sqft: number;
  ai_score: number;
}

const CompareProperties = () => {
  const { compareIds, removeCompareId, clearCompare } = useCompare();
  const [properties, setProperties] = useState<ComparedPropertySpecs[]>([]);
  const [highlights, setHighlights] = useState<{
    cheapest_property_id?: string | null;
    largest_property_id?: string | null;
    highest_ai_score_id?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) {
      setProperties([]);
      return;
    }

    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        // Try production gateway first
        let res = await fetch("https://apnaghar-gateway.onrender.com/api/compare/matrix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyIds: compareIds })
        }).catch(() => null);

        // Fallback to localhost gateway if production fails
        if (!res || !res.ok) {
          res = await fetch("http://localhost:5000/api/compare/matrix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyIds: compareIds })
          }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.properties) {
            setProperties(data.properties);
            if (data.highlights) setHighlights(data.highlights);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Compare backend unavailable, falling back to client-side mapping", err);
      }

      // Robust fallback mapping using client-side seed properties
      const mapped = compareIds.map((id) => {
        const seed = seedProperties.find((p) => p.id === id);
        if (seed) {
          const area = seed.area_sqft || seed.bhk * 550 || 1000;
          return {
            id: seed.id,
            title: seed.title,
            price: seed.price,
            location: seed.locality || seed.city,
            city: seed.city,
            bhk: seed.bhk,
            property_type: seed.property_type,
            status: seed.status,
            images: seed.images || [],
            amenities: seed.amenities || ["Parking", "Water Supply", "Security"],
            area_sqft: area,
            price_per_sqft: Math.round(seed.price / area),
            ai_score: seed.ai_score || 85,
          };
        }
        // Fallback placeholder for unknown DB IDs if network completely offline
        return {
          id,
          title: `Premium Listing #${id.slice(-4)}`,
          price: 15000000,
          location: "Premium Locality",
          city: "Mumbai",
          bhk: 3,
          property_type: "flat",
          status: "available",
          images: [],
          amenities: ["Swimming Pool", "Gym", "Parking", "Security"],
          area_sqft: 1500,
          price_per_sqft: 10000,
          ai_score: 88,
        };
      });

      // Compute local highlights
      let minPrice = Infinity;
      let maxArea = -1;
      let maxAi = -1;
      let cheapId = null;
      let largeId = null;
      let highAiId = null;

      mapped.forEach((p) => {
        if (p.price < minPrice) { minPrice = p.price; cheapId = p.id; }
        if (p.area_sqft > maxArea) { maxArea = p.area_sqft; largeId = p.id; }
        if (p.ai_score > maxAi) { maxAi = p.ai_score; highAiId = p.id; }
      });

      setProperties(mapped);
      setHighlights({
        cheapest_property_id: cheapId,
        largest_property_id: largeId,
        highest_ai_score_id: highAiId,
      });
      setLoading(false);
    };

    fetchComparisonData();
  }, [compareIds]);

  // Aggregate all unique amenities from all compared properties
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities))
  );

  return (
    <div className="container py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-accent/10 text-accent font-semibold gap-1">
              <Sparkles className="h-3 w-3" /> Advanced Feature
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">Enterprise Engine</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Property Comparison Matrix</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Side-by-side analytical evaluation of your shortlisted listings.
          </p>
        </div>

        {compareIds.length > 0 && (
          <div className="flex items-center gap-3">
            <Link to="/properties">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add More
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearCompare}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Clear All ({compareIds.length})
            </Button>
          </div>
        )}
      </div>

      {compareIds.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm max-w-xl mx-auto my-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-6">
            <GitCompare className="h-10 w-10 text-accent" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            No listings added to compare list
          </h3>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Browse through our premium listings and click the <strong className="text-foreground">Compare</strong> button on any property card to see comprehensive side-by-side specs here.
          </p>
          <Link to="/properties">
            <Button className="gap-2 px-6 shadow-sm hover:shadow transition-all">
              Explore Properties <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-12">
          {[...Array(compareIds.length)].map((_, i) => (
            <div key={i} className="h-[500px] rounded-xl bg-secondary/50 animate-pulse border" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[800px]">
            {/* Top Cards Row */}
            <div className="grid grid-cols-5 gap-4 border-b pb-6">
              <div className="col-span-1 flex flex-col justify-end pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Overview Specs
                </span>
                <span className="text-sm font-medium text-foreground mt-0.5">
                  {properties.length} Properties Selected
                </span>
              </div>

              {properties.map((property) => {
                const isCheapest = highlights.cheapest_property_id === property.id;
                const imgSrc = property.images && property.images[0] ? property.images[0] : getPropertyImage(property.images, property.property_type);

                return (
                  <div key={property.id} className="col-span-1 rounded-xl border bg-card p-3 shadow-xs relative flex flex-col justify-between group transition-all hover:shadow-sm">
                    <button
                      onClick={() => removeCompareId(property.id)}
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-80 hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    <div>
                      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-secondary mb-3">
                        <img
                          src={imgSrc}
                          alt={property.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isCheapest && (
                          <div className="absolute left-2 bottom-2">
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] font-bold px-1.5 py-0.5">
                              Best Price
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Link to={`/property/${property.id}`} className="block hover:underline">
                        <h4 className="font-display font-semibold text-xs text-foreground line-clamp-2 h-8 leading-tight">
                          {property.title}
                        </h4>
                      </Link>
                    </div>

                    <div className="mt-3 pt-2 border-t flex items-center justify-between">
                      <span className="text-sm font-bold text-accent">
                        {formatPrice(property.price)}
                      </span>
                      <Link to={`/property/${property.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Add Slot place if less than 4 */}
              {[...Array(4 - properties.length)].map((_, i) => (
                <div key={i} className="col-span-1 rounded-xl border-2 border-dashed border-muted/60 p-4 flex flex-col items-center justify-center text-center bg-secondary/20">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-2">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Add Listing</span>
                  <Link to="/properties" className="mt-2">
                    <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">Browse</Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Financial Highlights Row */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 bg-secondary/40 py-1.5 px-3 rounded">
                Financial Evaluation
              </h3>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-accent" /> Total Pricing
                </div>
                {properties.map((p) => (
                  <div key={p.id} className={`col-span-1 font-bold ${highlights.cheapest_property_id === p.id ? "text-emerald-600" : "text-foreground"}`}>
                    {formatPrice(p.price)}
                    {highlights.cheapest_property_id === p.id && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1 ml-1.5 font-semibold">Lowest</span>
                    )}
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground">Price per sq.ft</div>
                {properties.map((p) => (
                  <div key={p.id} className="col-span-1 text-foreground font-medium">
                    ₹{p.price_per_sqft.toLocaleString("en-IN")} / sq.ft
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-purple-500" /> AI Valuation Accuracy
                </div>
                {properties.map((p) => (
                  <div key={p.id} className="col-span-1 flex items-center gap-2">
                    <div className="w-12 bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${p.ai_score}%` }} />
                    </div>
                    <span className={`font-bold text-xs ${highlights.highest_ai_score_id === p.id ? "text-purple-600" : "text-foreground"}`}>
                      {p.ai_score}%
                    </span>
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>
            </div>

            {/* Property Specification Row */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 bg-secondary/40 py-1.5 px-3 rounded">
                Property Specifications
              </h3>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amber-500" /> Layout & BHK
                </div>
                {properties.map((p) => (
                  <div key={p.id} className="col-span-1 font-semibold text-foreground">
                    {p.bhk > 0 ? `${p.bhk} BHK` : "Commercial / Studio"}
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground">Super Built-up Area</div>
                {properties.map((p) => (
                  <div key={p.id} className={`col-span-1 font-medium ${highlights.largest_property_id === p.id ? "text-amber-600 font-bold" : "text-foreground"}`}>
                    {formatArea(p.area_sqft)}
                    {highlights.largest_property_id === p.id && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1 ml-1.5 font-semibold">Largest</span>
                    )}
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground">Property Type</div>
                {properties.map((p) => (
                  <div key={p.id} className="col-span-1 capitalize text-foreground">
                    {p.property_type}
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>

              <div className="grid grid-cols-5 gap-4 py-3 border-b text-sm items-center">
                <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" /> City & Locality
                </div>
                {properties.map((p) => (
                  <div key={p.id} className="col-span-1 text-xs text-foreground font-medium">
                    {p.location}, {p.city}
                  </div>
                ))}
                {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
              </div>
            </div>

            {/* Amenities Comparison Row */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 bg-secondary/40 py-1.5 px-3 rounded">
                Amenities Overlap Checklist
              </h3>

              {allAmenities.map((amenity, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-4 py-2.5 border-b text-sm items-center hover:bg-secondary/20 transition-colors rounded px-1">
                  <div className="col-span-1 text-xs font-medium text-muted-foreground">
                    {amenity}
                  </div>
                  {properties.map((p) => {
                    const hasAmenity = p.amenities.includes(amenity);
                    return (
                      <div key={p.id} className="col-span-1">
                        {hasAmenity ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50/80 border border-emerald-100 rounded-full py-0.5 px-2.5 w-fit">
                            <Check className="h-3 w-3 stroke-[3]" /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-medium px-2">
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {[...Array(4 - properties.length)].map((_, i) => <div key={i} className="col-span-1 text-muted-foreground/30">-</div>)}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CompareProperties;
