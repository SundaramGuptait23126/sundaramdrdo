import { useState } from "react";
import { Brain, Sparkles, TrendingUp, MapPin, Maximize, BedDouble, Home, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities, propertyTypes, formatPrice } from "@/lib/mockData";

const AIEstimatorWidget = () => {
  const [mode, setMode] = useState<"sale" | "rent">("sale");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [bhk, setBhk] = useState("");
  const [area, setArea] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = () => {
    if (!city || !type || !area) return;
    setLoading(true);
    setTimeout(() => {
      if (mode === "sale") {
        const baseRates: Record<string, number> = {
          Mumbai: 25000, Bangalore: 12000, Gurugram: 15000, Pune: 10000,
          Delhi: 18000, Hyderabad: 9000, Chennai: 8500, Kolkata: 7500,
          Goa: 20000, Noida: 8000, Ahmedabad: 7000,
        };
        const typeMultiplier: Record<string, number> = { flat: 1, villa: 1.6, plot: 0.7, commercial: 1.3 };
        const bhkMul = bhk ? 1 + Number(bhk) * 0.05 : 1;
        const base = (baseRates[city] || 10000) * (typeMultiplier[type] || 1) * bhkMul;
        setResult(Math.round(base * Number(area) * (0.9 + Math.random() * 0.2)));
      } else {
        const rentBase: Record<string, number> = {
          Mumbai: 45, Bangalore: 30, Gurugram: 35, Pune: 25,
          Delhi: 38, Hyderabad: 22, Chennai: 20, Kolkata: 18,
          Goa: 40, Noida: 20, Ahmedabad: 16,
        };
        const furnishMul = furnishing === "furnished" ? 1.3 : furnishing === "semi-furnished" ? 1.15 : 1;
        const bhkMul = bhk ? 1 + Number(bhk) * 0.08 : 1;
        const base = (rentBase[city] || 20) * Number(area) * furnishMul * bhkMul;
        setResult(Math.round(base * (0.9 + Math.random() * 0.2)));
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border-2 border-ai/20 bg-card p-6 shadow-elevated">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ai/10">
          <Brain className="h-6 w-6 text-ai" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-card-foreground">AI Price Estimator</h3>
          <p className="text-sm text-muted-foreground">Get instant AI-powered property valuation</p>
        </div>
      </div>

      {/* Sale/Rent toggle */}
      <div className="mb-4 flex rounded-lg border bg-secondary p-0.5">
        <button
          onClick={() => { setMode("sale"); setResult(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "sale" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
          }`}
        >
          <Home className="h-4 w-4" />Sale Price
        </button>
        <button
          onClick={() => { setMode("rent"); setResult(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "rent" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
          }`}
        >
          <Key className="h-4 w-4" />Rental Price
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Property Type" /></SelectTrigger>
          <SelectContent>
            {propertyTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={bhk} onValueChange={setBhk}>
          <SelectTrigger><BedDouble className="h-4 w-4 text-muted-foreground" /><SelectValue placeholder="BHK" /></SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((b) => <SelectItem key={b} value={String(b)}>{b} BHK</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Maximize className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="number" placeholder="Area (sq.ft)" value={area} onChange={(e) => setArea(e.target.value)} className="pl-10" />
        </div>
        {mode === "rent" && (
          <Select value={furnishing} onValueChange={setFurnishing}>
            <SelectTrigger><SelectValue placeholder="Furnishing Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="furnished">Furnished</SelectItem>
              <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Button onClick={estimate} disabled={!city || !type || !area || loading} className="mt-4 w-full gap-2 bg-ai text-ai-foreground hover:bg-ai/90">
        {loading ? <><Sparkles className="h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="h-4 w-4" />Get AI {mode === "sale" ? "Sale" : "Rental"} Estimate</>}
      </Button>

      {result && (
        <div className="mt-4 animate-scale-in rounded-xl bg-ai/5 border border-ai/20 p-4">
          <div className="flex items-center gap-2 text-sm text-ai font-medium mb-1">
            <TrendingUp className="h-4 w-4" />AI Predicted {mode === "sale" ? "Value" : "Monthly Rent"}
          </div>
          <p className="font-display text-3xl font-bold text-card-foreground">
            {formatPrice(result)}{mode === "rent" ? "/mo" : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on current market trends, location data, and comparable properties
          </p>
        </div>
      )}
    </div>
  );
};

export default AIEstimatorWidget;
