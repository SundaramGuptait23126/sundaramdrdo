import { Link } from "react-router-dom";
import { GitCompare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CompareProperties = () => {
  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Compare Properties</h1>
      <p className="text-muted-foreground mb-8">Select up to 4 properties to compare side by side.</p>

      <div className="rounded-xl border bg-card p-12 text-center shadow-card">
        <GitCompare className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">No properties selected for comparison</h3>
        <p className="text-muted-foreground mb-4">Browse properties and add them to compare features, prices, and amenities.</p>
        <Link to="/properties">
          <Button className="gap-2">Browse Properties <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
};

export default CompareProperties;
