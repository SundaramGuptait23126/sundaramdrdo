import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cities } from "@/lib/mockData";
import { formatPrice } from "@/lib/mockData";

export interface Filters {
  search: string;
  listingType: string;
  city: string;
  propertyType: string;
  bhk: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  constructionStatus: string;
  postedBy: string;
  furnishing: string;
  amenities: string[];
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount?: number;
}

const BUDGET_PRESETS_SALE = [
  { label: "Under ₹50L", min: 0, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000 },
  { label: "₹2Cr - ₹5Cr", min: 20000000, max: 50000000 },
  { label: "₹5Cr+", min: 50000000, max: 0 },
];

const BUDGET_PRESETS_RENT = [
  { label: "Under ₹10K", min: 0, max: 10000 },
  { label: "₹10K - ₹25K", min: 10000, max: 25000 },
  { label: "₹25K - ₹50K", min: 25000, max: 50000 },
  { label: "₹50K - ₹1L", min: 50000, max: 100000 },
  { label: "₹1L+", min: 100000, max: 0 },
];

const AMENITY_OPTIONS = [
  "Parking", "Lift", "Gym", "Swimming Pool", "Garden", "Security",
  "Power Backup", "Club House", "Children Play Area", "Wi-Fi",
];

const SearchFilters = ({ filters, onChange, resultCount }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);

  const update = (key: keyof Filters, value: string | string[]) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({
      search: "", listingType: "", city: "", propertyType: "", bhk: "",
      minPrice: "", maxPrice: "", sortBy: "newest", constructionStatus: "",
      postedBy: "", furnishing: "", amenities: [],
    });
  };

  const toggleAmenity = (a: string) => {
    const curr = filters.amenities || [];
    update("amenities", curr.includes(a) ? curr.filter((x) => x !== a) : [...curr, a]);
  };

  const isRental = filters.listingType === "rent";
  const budgetPresets = isRental ? BUDGET_PRESETS_RENT : BUDGET_PRESETS_SALE;

  const activeFilterCount = [
    filters.city, filters.propertyType, filters.bhk, filters.minPrice, filters.maxPrice,
    filters.constructionStatus, filters.postedBy, filters.furnishing,
  ].filter(Boolean).length + (filters.amenities?.length || 0);

  const propertyTypeOptions = filters.listingType === "rent"
    ? [
        { value: "flat", label: "Flat/Apartment" },
        { value: "villa", label: "Independent House/Villa" },
        { value: "commercial", label: "Commercial" },
      ]
    : [
        { value: "flat", label: "Flat/Apartment" },
        { value: "villa", label: "Independent House/Villa" },
        { value: "plot", label: "Plot/Land" },
        { value: "commercial", label: "Commercial" },
      ];

  return (
    <div className="rounded-xl border bg-card shadow-card">
      {/* Top bar: listing type toggle + search */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {/* Buy/Rent/Commercial/PG Toggle */}
          <div className="flex rounded-lg border bg-secondary p-0.5">
            {[
              { val: "", label: "All" },
              { val: "sale", label: "Buy" },
              { val: "rent", label: "Rent" },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => update("listingType", t.val)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.listingType === t.val ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location, project, or keyword..."
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter toggle */}
          <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Result count */}
          {resultCount !== undefined && (
            <div className="flex items-center text-sm text-muted-foreground font-medium">
              {resultCount} results
            </div>
          )}
        </div>

        {/* Quick BHK filter pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">BHK:</span>
          {[1, 2, 3, 4, 5].map((b) => (
            <button
              key={b}
              onClick={() => update("bhk", filters.bhk === String(b) ? "" : String(b))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filters.bhk === String(b) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {b}{b === 5 ? "+" : ""} BHK
            </button>
          ))}

          <span className="text-xs text-muted-foreground font-medium ml-2">Type:</span>
          {propertyTypeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => update("propertyType", filters.propertyType === t.value ? "" : t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filters.propertyType === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded advanced filters */}
      {expanded && (
        <div className="border-t p-4 animate-fade-in space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* City */}
            <Select value={filters.city} onValueChange={(v) => update("city", v)}>
              <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Construction Status */}
            <Select value={filters.constructionStatus} onValueChange={(v) => update("constructionStatus", v)}>
              <SelectTrigger><SelectValue placeholder="Construction Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ready">Ready to Move</SelectItem>
                <SelectItem value="under_construction">Under Construction</SelectItem>
                <SelectItem value="new_launch">New Launch</SelectItem>
              </SelectContent>
            </Select>

            {/* Posted By */}
            <Select value={filters.postedBy} onValueChange={(v) => update("postedBy", v)}>
              <SelectTrigger><SelectValue placeholder="Posted By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="dealer">Dealer/Agent</SelectItem>
                <SelectItem value="builder">Builder</SelectItem>
              </SelectContent>
            </Select>

            {/* Furnishing */}
            <Select value={filters.furnishing} onValueChange={(v) => update("furnishing", v)}>
              <SelectTrigger><SelectValue placeholder="Furnishing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furnished">Furnished</SelectItem>
                <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget presets */}
          <div>
            <button onClick={() => setShowBudget(!showBudget)} className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
              Budget <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showBudget ? "rotate-180" : ""}`} />
            </button>
            {showBudget && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                  {budgetPresets.map((p) => {
                    const active = filters.minPrice === String(p.min) && (p.max === 0 ? !filters.maxPrice : filters.maxPrice === String(p.max));
                    return (
                      <button
                        key={p.label}
                        onClick={() => {
                          onChange({
                            ...filters,
                            minPrice: String(p.min),
                            maxPrice: p.max === 0 ? "" : String(p.max),
                          });
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:border-primary"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Input type="number" placeholder={`Min (₹)`} value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} className="flex-1" />
                  <span className="flex items-center text-muted-foreground">to</span>
                  <Input type="number" placeholder={`Max (₹)`} value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} className="flex-1" />
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <button onClick={() => setShowAmenities(!showAmenities)} className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
              Amenities <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAmenities ? "rotate-180" : ""}`} />
            </button>
            {showAmenities && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 animate-fade-in">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    <Checkbox
                      checked={(filters.amenities || []).includes(a)}
                      onCheckedChange={() => toggleAmenity(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort + Clear */}
          <div className="flex items-center justify-between border-t pt-3">
            <Select value={filters.sortBy} onValueChange={(v) => update("sortBy", v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="ai-score">AI Score</SelectItem>
                <SelectItem value="area-high">Area: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground">
                <X className="h-3 w-3" /> Clear all filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {activeFilterCount > 0 && !expanded && (
        <div className="border-t px-4 py-2 flex flex-wrap gap-1.5">
          {filters.city && <Badge variant="secondary" className="gap-1 text-xs">{filters.city} <X className="h-3 w-3 cursor-pointer" onClick={() => update("city", "")} /></Badge>}
          {filters.propertyType && <Badge variant="secondary" className="gap-1 text-xs capitalize">{filters.propertyType} <X className="h-3 w-3 cursor-pointer" onClick={() => update("propertyType", "")} /></Badge>}
          {filters.bhk && <Badge variant="secondary" className="gap-1 text-xs">{filters.bhk} BHK <X className="h-3 w-3 cursor-pointer" onClick={() => update("bhk", "")} /></Badge>}
          {filters.furnishing && <Badge variant="secondary" className="gap-1 text-xs capitalize">{filters.furnishing} <X className="h-3 w-3 cursor-pointer" onClick={() => update("furnishing", "")} /></Badge>}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.minPrice ? formatPrice(Number(filters.minPrice)) : "₹0"} - {filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : "Any"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => { update("minPrice", ""); update("maxPrice", ""); }} />
            </Badge>
          )}
          <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear all</button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
