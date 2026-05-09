import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building2, AlertTriangle, TrendingUp, Home, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalUsers: number;
  saleListings: number;
  rentalListings: number;
  activeRentals: number;
  flaggedListings: number;
}

interface PropertyRow {
  id: string;
  title: string;
  city: string;
  price: number;
  listing_type: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, saleListings: 0, rentalListings: 0, activeRentals: 0, flaggedListings: 0 });
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (userRole && userRole !== "admin") {
      toast({ title: "Access Denied", description: "Admin access required.", variant: "destructive" });
      navigate("/");
      return;
    }
    fetchData();
  }, [user, userRole]);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, propsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
    ]);

    const allProps = (propsRes.data || []) as PropertyRow[];
    setProperties(allProps);
    setStats({
      totalUsers: profilesRes.count || 0,
      saleListings: allProps.filter((p) => p.listing_type === "sale").length,
      rentalListings: allProps.filter((p) => p.listing_type === "rent").length,
      activeRentals: allProps.filter((p) => p.status === "rented").length,
      flaggedListings: allProps.filter((p) => p.status === "under_review").length,
    });
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("properties").update({ status: status as any }).eq("id", id);
    toast({ title: `Property ${status}` });
    fetchData();
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-ai" },
    { icon: Home, label: "Sale Listings", value: stats.saleListings, color: "text-accent" },
    { icon: DollarSign, label: "Rental Listings", value: stats.rentalListings, color: "text-success" },
    { icon: Building2, label: "Active Rentals", value: stats.activeRentals, color: "text-warning" },
    { icon: AlertTriangle, label: "Flagged", value: stats.flaggedListings, color: "text-destructive" },
  ];

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Platform overview and management</p>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display text-lg font-semibold">All Properties</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">{p.listing_type}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        p.status === "active" ? "bg-success text-success-foreground border-0" :
                        p.status === "under_review" ? "bg-warning text-warning-foreground border-0" :
                        ""
                      }
                      variant={p.status === "active" || p.status === "under_review" ? "default" : "outline"}
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.status === "under_review" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "active")}>
                          Approve
                        </Button>
                      )}
                      {p.status === "active" && (
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(p.id, "under_review")}>
                          Flag
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
