import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Brain, TrendingUp, Shield, ArrowRight, Building2, MapPin,
  Home, Key, Heart, Eye, ChevronRight, Calculator, BarChart3,
  Landmark, Building, Trees, Store, Warehouse, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import PropertyCard from "@/components/PropertyCard";
import { seedProperties, cities, formatPrice } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Property } from "@/lib/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "commercial" | "plots">("buy");
  const [searchCity, setSearchCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("https://apnaghar-gateway.onrender.com/api/properties/all");
        const data = await res.json();
        if (data.success && data.properties) {
          setDbProperties(data.properties.map((p: any) => ({
            ...p,
            id: (p._id || p.id).toString(),
            title: p.title,
            price: Number(p.price) || 0,
            location: p.location,
            city: p.location,
            locality: p.location || "",
            listing_type: "sale",
            property_type: p.property_type || "flat",
            status: p.status,
            images: p.image_url ? (() => {
              try {
                const parsed = JSON.parse(p.image_url);
                return Array.isArray(parsed) ? parsed : [p.image_url];
              } catch {
                return [p.image_url];
              }
            })() : [],
            amenities: [],
            baths: 0,
            beds: p.bhk,
            area_sqft: 0,
            created_at: p.createdAt || p.created_at || new Date().toISOString()
          })));
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      }
    };
    fetchProperties();
  }, []);

  const allProperties = dbProperties.length > 0 ? dbProperties : seedProperties;

  const getFiltered = () => {
    switch (activeTab) {
      case "buy": return allProperties.filter((p) => p.listing_type === "sale" && p.property_type !== "commercial");
      case "rent": return allProperties.filter((p) => p.listing_type === "rent");
      case "commercial": return allProperties.filter((p) => p.property_type === "commercial");
      case "plots": return allProperties.filter((p) => p.property_type === "plot");
      default: return allProperties;
    }
  };

  const featured = getFiltered().slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab === "buy") params.set("type", "sale");
    if (activeTab === "rent") params.set("type", "rent");
    if (activeTab === "commercial") params.set("propertyType", "commercial");
    if (activeTab === "plots") params.set("propertyType", "plot");
    if (searchCity) params.set("city", searchCity);
    if (searchQuery) params.set("search", searchQuery);
    navigate(`/properties?${params.toString()}`);
  };

  const tabs = [
    { id: "buy" as const, label: "Buy", icon: Home },
    { id: "rent" as const, label: "Rent", icon: Key },
    { id: "commercial" as const, label: "Commercial", icon: Building2 },
    { id: "plots" as const, label: "Plots/Land", icon: Trees },
  ];

  const propertyCategories = [
    { label: "Residential Apartment", count: "16,000+", icon: Building, color: "bg-accent/10 text-accent", link: "/properties?propertyType=flat" },
    { label: "Residential Land", count: "5,900+", icon: Trees, color: "bg-success/10 text-success", link: "/properties?propertyType=plot" },
    { label: "Independent House / Villa", count: "2,700+", icon: Home, color: "bg-primary/10 text-primary", link: "/properties?propertyType=villa" },
    { label: "Commercial Space", count: "1,200+", icon: Store, color: "bg-warning/10 text-warning", link: "/properties?propertyType=commercial" },
  ];

  return (
    <div className="bg-background">
      {/* Hero with Search */}
      <section className="relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container relative z-10 py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            {/* Search Card */}
            <div className="rounded-xl bg-white shadow-elevated p-5 md:p-6">
              {/* Tabs */}
              <div className="flex gap-0 border-b mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search inputs */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <Select value={searchCity} onValueChange={setSearchCity}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <SearchAutocomplete value={searchQuery} onChange={setSearchQuery} />
                <Button type="submit" className="gap-2 px-6">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-card">
        <div className="container grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            { value: "10,000+", label: "Properties Listed" },
            { value: "5,000+", label: "Happy Buyers" },
            { value: "50+", label: "Cities Covered" },
            { value: "95%", label: "AI Accuracy" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl font-bold text-foreground md:text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main content with sidebar layout */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Recommended Properties */}
            <section className="mb-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Recommended Properties
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Curated especially for you</p>
                </div>
                <Link to={`/properties?type=${activeTab === "rent" ? "rent" : "sale"}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.length > 0
                  ? featured.map((p) => <PropertyCard key={p.id} property={p} />)
                  : <p className="col-span-full text-center text-muted-foreground py-8">No properties found.</p>
                }
              </div>
            </section>

            {/* Property Categories */}
            <section className="mb-10">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Apartments, Villas and more</h2>
              <p className="text-sm text-muted-foreground mb-5">Browse by property type</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {propertyCategories.map((cat) => (
                  <Link key={cat.label} to={cat.link} className="group rounded-xl border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${cat.color} mb-3`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{cat.count} Properties</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* AI Features */}
            <section className="mb-10">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">AI-Powered Features</h2>
              <p className="text-sm text-muted-foreground mb-5">Smart tools for smarter decisions</p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: TrendingUp, title: "Price Prediction", desc: "ML-powered property valuation using market data and trends.", link: "/ai-estimator" },
                  { icon: Brain, title: "Smart Search", desc: "AI-personalized property recommendations based on your behavior.", link: "/properties" },
                  { icon: Shield, title: "Fraud Detection", desc: "AI verification to identify suspicious listings.", link: "/properties" },
                ].map((f) => (
                  <Link key={f.title} to={f.link} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-elevated transition-all group">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ai/10">
                      <f.icon className="h-5 w-5 text-ai" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Popular Cities */}
            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Top Cities</h2>
              <p className="text-sm text-muted-foreground mb-5">Explore properties across India</p>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {cities.map((city) => (
                  <Link
                    key={city}
                    to={`/properties?city=${city}`}
                    className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center shadow-card hover:shadow-elevated hover:border-primary transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-card-foreground">{city}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar - desktop only */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5">
            {/* Guest / User card */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-semibold text-sm text-card-foreground">
                  {user ? user.email?.split("@")[0] : "Guest User"}
                </span>
              </div>
              {user ? (
                <div className="space-y-1 text-sm">
                  <Link to="/properties" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Eye className="h-4 w-4" /> Recently Viewed
                  </Link>
                  <Link to="/properties" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Heart className="h-4 w-4" /> Shortlisted
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-accent font-medium mb-1">Your Recent Activity</p>
                  <p className="text-xs text-muted-foreground mb-3">No activity yet! Start browsing properties and track them from here.</p>
                  <Link to="/auth">
                    <Button className="w-full">LOGIN / REGISTER</Button>
                  </Link>
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">to access all features on ApnaGhar</p>
                </>
              )}
            </div>

            {/* Post Property CTA */}
            <div className="rounded-xl border bg-success/5 p-4 shadow-card">
              <h3 className="font-display text-base font-bold text-card-foreground">Sell or rent faster at the right price!</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">List your property now</p>
              <Link to="/post-property">
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-1">
                  Post Property, It's FREE
                </Button>
              </Link>
            </div>

            {/* Quick links */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h4 className="font-display text-sm font-semibold text-card-foreground mb-3">Explore our Services</h4>
              <div className="space-y-1.5 text-sm">
                <Link to="/properties?type=sale" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-3 w-3" /> For Buyers
                </Link>
                <Link to="/properties?type=rent" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-3 w-3" /> For Tenants
                </Link>
                <Link to="/post-property" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-3 w-3" /> For Owners
                </Link>
                <Link to="/ai-estimator" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-3 w-3" /> AI Insights
                </Link>
                <Link to="/emi-calculator" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-3 w-3" /> EMI Calculator
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
