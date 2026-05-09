import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SavedProperties = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground">Sign in to view saved properties</h2>
        <p className="mt-2 text-muted-foreground">Save properties you like and access them anytime.</p>
        <Link to="/auth"><Button className="mt-4">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Saved Properties</h1>
      <p className="text-muted-foreground mb-8">Properties you've shortlisted will appear here.</p>

      <div className="rounded-xl border bg-card p-12 text-center shadow-card">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">No saved properties yet</h3>
        <p className="text-muted-foreground mb-4">Browse properties and tap the heart icon to save them for later.</p>
        <Link to="/properties">
          <Button className="gap-2">Browse Properties <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
};

export default SavedProperties;
