import { useState } from "react";
import { TrendingUp, Shield, BarChart3, MapPin, Star, Home } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities } from "@/lib/mockData";

const localityData: Record<string, { avgPrice: string; rental: string; safety: number; livability: number; growth: string; pros: string[]; cons: string[] }> = {
  Mumbai: { avgPrice: "₹1.8 Cr", rental: "₹45K/mo", safety: 7.5, livability: 8.2, growth: "+12%", pros: ["Metro connectivity", "Employment hubs", "Healthcare"], cons: ["High cost", "Traffic congestion", "Flooding risk"] },
  Bangalore: { avgPrice: "₹95L", rental: "₹28K/mo", safety: 8.0, livability: 8.5, growth: "+18%", pros: ["IT hub", "Weather", "Cosmopolitan"], cons: ["Traffic", "Water scarcity", "Infrastructure gaps"] },
  Gurugram: { avgPrice: "₹1.2 Cr", rental: "₹32K/mo", safety: 7.0, livability: 7.8, growth: "+15%", pros: ["Corporate hubs", "Modern infra", "Metro"], cons: ["Air quality", "Water issues", "High prices"] },
  Pune: { avgPrice: "₹75L", rental: "₹20K/mo", safety: 8.2, livability: 8.7, growth: "+14%", pros: ["Education hub", "IT sector", "Culture"], cons: ["Infrastructure", "Hill traffic", "Monsoon"] },
  Delhi: { avgPrice: "₹1.5 Cr", rental: "₹35K/mo", safety: 6.5, livability: 7.5, growth: "+10%", pros: ["Capital city", "Metro", "Heritage"], cons: ["Pollution", "Traffic", "Summer heat"] },
  Hyderabad: { avgPrice: "₹85L", rental: "₹22K/mo", safety: 8.0, livability: 8.4, growth: "+20%", pros: ["IT corridor", "Affordable", "Food culture"], cons: ["Traffic in IT areas", "Summer heat", "Flooding"] },
};

const LocalityInsights = () => {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const data = localityData[selectedCity] || localityData.Mumbai;

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Locality Insights</h1>
      <p className="text-muted-foreground mb-6">AI-powered analytics for smarter property decisions.</p>

      <Select value={selectedCity} onValueChange={setSelectedCity}>
        <SelectTrigger className="w-64 mb-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          {cities.filter((c) => localityData[c]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: Home, label: "Avg. Property Price", value: data.avgPrice, color: "text-primary" },
          { icon: BarChart3, label: "Avg. Rental", value: data.rental, color: "text-success" },
          { icon: Shield, label: "Safety Score", value: `${data.safety}/10`, color: "text-ai" },
          { icon: TrendingUp, label: "YoY Growth", value: data.growth, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <s.icon className={`h-6 w-6 ${s.color} mb-2`} />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-success" /> Pros
          </h3>
          <ul className="space-y-2">
            {data.pros.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" /> Cons
          </h3>
          <ul className="space-y-2">
            {data.cons.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">Livability Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
            <span className="font-display text-2xl font-bold text-primary">{data.livability}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall livability rating for {selectedCity}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on connectivity, amenities, safety, and growth potential.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalityInsights;
