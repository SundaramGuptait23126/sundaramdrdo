import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchFilters, { type Filters } from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { seedProperties, type Property } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 18;

  const buildFiltersFromParams = () => ({
    search: searchParams.get("search") || "",
    listingType: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    bhk: searchParams.get("bhk") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: "newest" as const,
    constructionStatus: searchParams.get("constructionStatus") || "",
    postedBy: "",
    furnishing: searchParams.get("furnishing") || "",
    amenities: [] as string[],
  });

  const [filters, setFilters] = useState<Filters>(buildFiltersFromParams);

  // Sync filters when URL search params change
  useEffect(() => {
    setFilters(buildFiltersFromParams());
  }, [searchParams]);

  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("https://apnaghar-load-balancer.onrender.com/api/properties/all");
        const data = await res.json();
        if (data.success && data.properties) {
          setDbProperties(data.properties.map((p: any) => ({
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
          })));
        }
      } catch (err) {
        console.error("Fetch properties error:", err);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const allProperties = dbProperties.length > 0 ? dbProperties : seedProperties;

  const filtered = useMemo(() => {
    let result = [...allProperties];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q));
    }
    if (filters.listingType) result = result.filter((p) => p.listing_type === filters.listingType);
    if (filters.city) result = result.filter((p) => p.city === filters.city);
    if (filters.propertyType) result = result.filter((p) => p.property_type === filters.propertyType);
    if (filters.bhk) result = result.filter((p) => p.bhk === Number(filters.bhk));
    if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice));
    if (filters.furnishing) result = result.filter((p) => p.furnishing_status === filters.furnishing);
    if (filters.amenities?.length > 0) result = result.filter((p) => filters.amenities.every((a) => p.amenities.includes(a)));

    switch (filters.sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "ai-score": result.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0)); break;
      case "area-high": result.sort((a, b) => b.area_sqft - a.area_sqft); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [filters, allProperties]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">{loading ? "Loading..." : `${filtered.length} properties found`}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5">
          <button onClick={() => setLayout("grid")} className={`rounded-md p-1.5 transition-colors ${layout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setLayout("list")} className={`rounded-md p-1.5 transition-colors ${layout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SearchFilters filters={filters} onChange={setFilters} resultCount={loading ? undefined : filtered.length} />

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : layout === "list" ? (
        <div className="mt-6 space-y-4">
          {paginated.map((p) => <PropertyCard key={p.id} property={p} layout="list" />)}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No properties match your criteria.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Properties;
