import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search, Menu, X, Building2, Plus, LogOut, User, ChevronDown,
  Home, Key, Brain, Shield, Calculator, Heart, Clock, Phone, MessageCircle,
  Store, Trees, Warehouse, Users, Newspaper, MapPin, BarChart3,
  Scale, Bookmark, GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCompare } from "@/contexts/CompareContext";
import ProfileModal from "./ProfileModal";

interface MegaMenuData {
  label: string;
  sections: { title: string; links: { label: string; to: string; badge?: string }[] }[];
}

const buyMenu: MegaMenuData = {
  label: "BUY A HOME",
  sections: [
    {
      title: "Property Types",
      links: [
        { label: "Flat/Apartment", to: "/properties?type=sale&propertyType=flat" },
        { label: "Independent House/Villa", to: "/properties?type=sale&propertyType=villa" },
        { label: "Residential Land/Plot", to: "/properties?type=sale&propertyType=plot" },
        { label: "Builder Floor", to: "/properties?type=sale&propertyType=flat&bhk=3" },
        { label: "Farm House", to: "/properties?type=sale&propertyType=villa" },
      ],
    },
    {
      title: "Popular Searches",
      links: [
        { label: "Ready to Move", to: "/properties?type=sale&constructionStatus=ready" },
        { label: "Under Construction", to: "/properties?type=sale&constructionStatus=under_construction" },
        { label: "New Launch", to: "/properties?type=sale&constructionStatus=new_launch" },
        { label: "Premium Properties", to: "/properties?type=sale&sortBy=price-high" },
      ],
    },
    {
      title: "Budget Ranges",
      links: [
        { label: "Under ₹50 Lakh", to: "/properties?type=sale&maxPrice=5000000" },
        { label: "₹50L - ₹1 Crore", to: "/properties?type=sale&minPrice=5000000&maxPrice=10000000" },
        { label: "₹1Cr - ₹2 Crore", to: "/properties?type=sale&minPrice=10000000&maxPrice=20000000" },
        { label: "Above ₹2 Crore", to: "/properties?type=sale&minPrice=20000000" },
      ],
    },
  ],
};

const rentMenu: MegaMenuData = {
  label: "RENT A HOME",
  sections: [
    {
      title: "Property Types",
      links: [
        { label: "Flat/Apartment", to: "/properties?type=rent&propertyType=flat" },
        { label: "Independent House/Villa", to: "/properties?type=rent&propertyType=villa" },
        { label: "PG / Co-living", to: "/properties?type=rent&propertyType=flat&furnishing=furnished" },
        { label: "Serviced Apartments", to: "/properties?type=rent&propertyType=flat&furnishing=furnished" },
      ],
    },
    {
      title: "Budget Ranges",
      links: [
        { label: "Under ₹10K/mo", to: "/properties?type=rent&maxPrice=10000" },
        { label: "₹10K - ₹25K/mo", to: "/properties?type=rent&minPrice=10000&maxPrice=25000" },
        { label: "₹25K - ₹50K/mo", to: "/properties?type=rent&minPrice=25000&maxPrice=50000" },
        { label: "Above ₹50K/mo", to: "/properties?type=rent&minPrice=50000" },
      ],
    },
    {
      title: "Furnishing",
      links: [
        { label: "Fully Furnished", to: "/properties?type=rent&furnishing=furnished" },
        { label: "Semi-Furnished", to: "/properties?type=rent&furnishing=semi-furnished" },
        { label: "Unfurnished", to: "/properties?type=rent&furnishing=unfurnished" },
      ],
    },
  ],
};

const commercialMenu: MegaMenuData = {
  label: "COMMERCIAL",
  sections: [
    {
      title: "Buy Commercial",
      links: [
        { label: "Office Space", to: "/properties?type=sale&propertyType=commercial" },
        { label: "Shops", to: "/properties?type=sale&propertyType=commercial" },
        { label: "Showrooms", to: "/properties?type=sale&propertyType=commercial" },
        { label: "Industrial Land/Plots", to: "/properties?type=sale&propertyType=plot" },
      ],
    },
    {
      title: "Rent Commercial",
      links: [
        { label: "Ready to Move Offices", to: "/properties?type=rent&propertyType=commercial" },
        { label: "Co-working Spaces", to: "/properties?type=rent&propertyType=commercial" },
        { label: "Warehouses", to: "/properties?type=rent&propertyType=commercial" },
        { label: "Factory", to: "/properties?type=rent&propertyType=commercial" },
      ],
    },
  ],
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const { compareIds } = useCompare();
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveMega(null); setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setActiveMega(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navItems = [
    { id: "buy", label: "Buy", menu: buyMenu },
    { id: "rent", label: "Rent", menu: rentMenu },
    { id: "commercial", label: "Commercial", menu: commercialMenu },
  ];

  const renderMegaMenu = (menu: MegaMenuData) => (
    <div className="absolute left-0 right-0 top-full z-50 border-b bg-card shadow-elevated animate-fade-in">
      <div className="container py-6">
        <div className="grid gap-8 md:grid-cols-3">
          {menu.sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h4>
              <ul className="space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors">
                      {link.label}
                      {link.badge && <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{link.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50" ref={megaRef}>
      {/* Top bar */}
      <div className="bg-[hsl(var(--nav-bg))] text-[hsl(var(--nav-foreground))] shadow-md">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Building2 className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-white">ApnaGhar</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl items-center">
            <div className="flex w-full items-center rounded-md bg-white overflow-hidden">
              <Input placeholder="Enter Locality / Project / Landmark" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-9" />
              <button type="submit" className="flex items-center justify-center h-9 w-10 text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/post-property">
              <Button size="sm" variant="outline" className="gap-1.5 border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold text-xs whitespace-nowrap">
                <Plus className="h-3.5 w-3.5" /> Post Property
                <span className="ml-1 rounded bg-success px-1.5 py-0.5 text-[10px] font-bold text-success-foreground">FREE</span>
              </Button>
            </Link>

            <div className="relative ml-1">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-white/10 transition-colors">
                <User className="h-4 w-4" /><ChevronDown className="h-3 w-3" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-card shadow-elevated z-50 animate-fade-in">
                  {user ? (
                    <div className="p-2">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-sm font-semibold text-card-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole || "User"}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary font-medium"
                      >
                        <User className="h-4 w-4 text-primary" /> My Profile Details
                      </button>
                      <Link to="/saved" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                        <Bookmark className="h-4 w-4" /> Saved Properties
                      </Link>
                      <Link to="/compare" onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                        <span className="flex items-center gap-2"><GitCompare className="h-4 w-4" /> Compare</span>
                        {compareIds.length > 0 && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">{compareIds.length}</span>}
                      </Link>
                      <Link to="/post-property" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                        <Plus className="h-4 w-4" /> Post Property
                      </Link>
                      <Link to="/my-properties" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                        <Building2 className="h-4 w-4" /> My Properties
                      </Link>
                      <Link to="/inquiries" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                        <MessageCircle className="h-4 w-4" /> My Inquiries (Leads)
                      </Link>
                      {userRole === "admin" && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                          <Shield className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="p-3">
                      <Link to="/auth" onClick={() => setUserMenuOpen(false)}>
                        <Button className="w-full mb-2">LOGIN / REGISTER</Button>
                      </Link>
                      <div className="space-y-1 pt-1 border-t">
                        <Link to="/post-property" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-card-foreground hover:bg-secondary">
                          <Plus className="h-4 w-4" /> Post Property <span className="ml-auto rounded bg-success px-1.5 py-0.5 text-[10px] font-bold text-success-foreground">FREE</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to={user ? "/my-properties" : "/auth"} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
              <Menu className="h-5 w-5" />
            </Link>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sub navigation with mega-menus */}
      <div className="hidden md:block border-b bg-white relative">
        <div className="container flex items-center gap-0 h-10 text-sm">
          {navItems.map((item) => (
            <button key={item.id}
              onMouseEnter={() => setActiveMega(item.id)}
              onClick={() => setActiveMega(activeMega === item.id ? null : item.id)}
              className={`flex items-center gap-1 px-4 h-full font-semibold transition-colors border-b-2 -mb-px ${
                activeMega === item.id ? "text-primary border-primary" : "text-foreground border-transparent hover:text-primary hover:border-primary"
              }`}
            >
              {item.label} <ChevronDown className="h-3 w-3" />
            </button>
          ))}
          <Link to="/properties?propertyType=plot" className="flex items-center gap-1 px-4 h-full font-semibold text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors -mb-px">
            Plots/Land
          </Link>
          <div className="h-4 w-px bg-border mx-1" />
          <Link to="/ai-estimator" className="flex items-center gap-1.5 px-4 h-full font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors -mb-px">
            <Brain className="h-3.5 w-3.5" /> AI Insights
            <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">NEW</span>
          </Link>
          <Link to="/emi-calculator" className="flex items-center gap-1.5 px-4 h-full font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors -mb-px">
            <Calculator className="h-3.5 w-3.5" /> EMI Calculator
          </Link>
          <Link to="/map" className="flex items-center gap-1.5 px-4 h-full font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors -mb-px">
            <MapPin className="h-3.5 w-3.5" /> Map View
          </Link>
        </div>

        {/* Mega menu dropdowns */}
        {navItems.map((item) => activeMega === item.id && (
          <div key={item.id} onMouseLeave={() => setActiveMega(null)}>
            {renderMegaMenu(item.menu)}
          </div>
        ))}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-[hsl(var(--nav-bg))] p-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex items-center rounded-md bg-white overflow-hidden">
              <Input placeholder="Search locality, project..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-foreground focus-visible:ring-0 h-9" />
              <button type="submit" className="h-9 w-10 flex items-center justify-center text-muted-foreground"><Search className="h-4 w-4" /></button>
            </div>
          </form>
          <div className="flex flex-col gap-1">
            {[
              { to: "/properties?type=sale", label: "Buy a Home", icon: Home },
              { to: "/properties?type=rent", label: "Rent a Home", icon: Key },
              { to: "/properties?propertyType=commercial", label: "Commercial", icon: Store },
              { to: "/properties?propertyType=plot", label: "Plots/Land", icon: Trees },
              { to: "/ai-estimator", label: "AI Insights", icon: Brain },
              { to: "/emi-calculator", label: "EMI Calculator", icon: Calculator },
              { to: "/saved", label: "Saved Properties", icon: Bookmark },
              { to: "/compare", label: "Compare", icon: GitCompare },
              { to: "/map", label: "Map View", icon: MapPin },
            ].map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
                <span className="flex items-center gap-2"><l.icon className="h-4 w-4" />{l.label}</span>
                {l.to === "/compare" && compareIds.length > 0 && (
                  <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">{compareIds.length}</span>
                )}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/my-properties" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
                  <Building2 className="h-4 w-4" />My Properties
                </Link>
                <Link to="/inquiries" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
                  <MessageCircle className="h-4 w-4" />My Inquiries (Leads)
                </Link>
              </>
            )}
            <div className="border-t border-white/10 mt-2 pt-2">
              <Link to="/post-property" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full gap-2"><Plus className="h-4 w-4" />Post Property FREE</Button>
              </Link>
              {user ? (
                <Button variant="ghost" size="sm" className="w-full mt-1 text-white/80 hover:text-white hover:bg-white/10 justify-start gap-2" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4" />Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full mt-1 border-white/30 text-white hover:bg-white/10 gap-2">
                    <User className="h-4 w-4" />Login / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
      <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
    </nav>
  );
};

export default Navbar;
