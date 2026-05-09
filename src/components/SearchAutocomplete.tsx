import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Building2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  type: "locality" | "city" | "project";
  label: string;
  sublabel?: string;
  count?: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchAutocomplete = ({ value, onChange, placeholder, className }: Props) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const q = value.toLowerCase();

      // Search localities
      const { data: localities } = await supabase
        .from("properties")
        .select("locality, city")
        .ilike("locality", `%${q}%`)
        .eq("status", "active")
        .limit(20);

      // Search cities
      const { data: cities } = await supabase
        .from("properties")
        .select("city")
        .ilike("city", `%${q}%`)
        .eq("status", "active")
        .limit(10);

      // Search by title (project names)
      const { data: projects } = await supabase
        .from("properties")
        .select("title, city")
        .ilike("title", `%${q}%`)
        .eq("status", "active")
        .limit(5);

      const results: Suggestion[] = [];

      // Deduplicate cities
      const uniqueCities = new Set<string>();
      cities?.forEach((c) => {
        if (!uniqueCities.has(c.city)) {
          uniqueCities.add(c.city);
          results.push({ type: "city", label: c.city });
        }
      });

      // Deduplicate localities
      const uniqueLocalities = new Set<string>();
      localities?.forEach((l) => {
        const key = `${l.locality}-${l.city}`;
        if (!uniqueLocalities.has(key)) {
          uniqueLocalities.add(key);
          results.push({ type: "locality", label: l.locality, sublabel: l.city });
        }
      });

      // Projects
      projects?.forEach((p) => {
        results.push({ type: "project", label: p.title, sublabel: p.city });
      });

      setSuggestions(results.slice(0, 8));
      setOpen(results.length > 0);
      setLoading(false);
    }, 300);
  }, [value]);

  const iconFor = (type: Suggestion["type"]) => {
    switch (type) {
      case "city": return <MapPin className="h-4 w-4 text-primary" />;
      case "locality": return <MapPin className="h-4 w-4 text-muted-foreground" />;
      case "project": return <Building2 className="h-4 w-4 text-accent" />;
    }
  };

  const labelFor = (type: Suggestion["type"]) => {
    switch (type) {
      case "city": return "City";
      case "locality": return "Locality";
      case "project": return "Project";
    }
  };

  return (
    <div ref={ref} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder || "Search by locality, project, or landmark..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={`pl-10 ${className || ""}`}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-card shadow-elevated max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching...</div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  onChange(s.label);
                  setOpen(false);
                }}
              >
                {iconFor(s.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{s.label}</p>
                  {s.sublabel && (
                    <p className="text-xs text-muted-foreground">{s.sublabel}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {labelFor(s.type)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
