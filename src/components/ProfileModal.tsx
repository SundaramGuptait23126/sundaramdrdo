import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, Building2, MessageCircle, Bookmark, LogOut, Edit2, Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user, userRole, signOut } = useAuth();
  const { compareIds } = useCompare();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  // Initialize editable fields when modal opens or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || user.email?.split("@")[0] || "User");
      setRole(userRole || user.role || "buyer");
    }
    // Get saved properties count from localStorage
    try {
      const saved = localStorage.getItem("savedProperties");
      if (saved) {
        setSavedCount(JSON.parse(saved).length);
      }
    } catch (e) {
      setSavedCount(0);
    }
  }, [user, userRole, open]);

  const handleSaveProfile = () => {
    if (!user) return;
    
    // Update local storage user object
    const updatedUser = { ...user, name, role };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Show premium wow toast
    toast({
      title: "Profile Updated Successfully!",
      description: "Your comprehensive profile details have been saved.",
    });
    
    setIsEditing(false);
    // Reload page slightly or trigger contextual update if needed
    // In our app, local storage update persists cleanly
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 border-0 shadow-2xl rounded-2xl bg-card">
        {/* Premium Header Gradient */}
        <div className="relative bg-gradient-to-r from-primary via-accent to-primary p-6 text-white text-center">
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
            <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" /> Verified Profile
          </div>
          
          {/* Avatar with glowing outer ring */}
          <div className="mx-auto mt-2 mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-xl ring-4 ring-white/30 text-2xl font-extrabold uppercase">
            {user ? (name[0] || user.email?.[0] || "U") : "G"}
          </div>

          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {user ? name : "Guest Account"}
          </DialogTitle>
          <p className="text-xs text-white/80 mt-0.5 font-medium">
            {user ? user.email : "Welcome to ApnaGhar Portal"}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">
          {user ? (
            <>
              {/* Comprehensive Details & Edit Mode */}
              <div className="space-y-3 bg-secondary/40 p-3.5 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Data</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                  >
                    {isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Display Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Primary Role</label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-8 text-xs mt-0.5">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="seller">Seller</SelectItem>
                          <SelectItem value="landlord">Landlord</SelectItem>
                          <SelectItem value="agent">Real Estate Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      className="w-full h-8 text-xs font-bold mt-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                    >
                      Save Profile Updates
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-background p-2 rounded-lg border border-border/40">
                      <span className="text-[10px] text-muted-foreground block font-medium">User ID</span>
                      <span className="font-mono font-bold truncate block text-foreground">{user.id || "USR-2026"}</span>
                    </div>
                    <div className="bg-background p-2 rounded-lg border border-border/40">
                      <span className="text-[10px] text-muted-foreground block font-medium">Role</span>
                      <span className="font-bold text-primary capitalize block">{role}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Metrics / Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => { onOpenChange(false); navigate("/saved"); }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-secondary/30 border border-border hover:border-primary/50 cursor-pointer transition-all hover:scale-105 group"
                >
                  <Bookmark className="h-4 w-4 text-primary mb-1 group-hover:text-accent transition-colors" />
                  <span className="text-sm font-extrabold text-foreground">{savedCount}</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Saved</span>
                </div>

                <div
                  onClick={() => { onOpenChange(false); navigate("/compare"); }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-secondary/30 border border-border hover:border-primary/50 cursor-pointer transition-all hover:scale-105 group"
                >
                  <Shield className="h-4 w-4 text-primary mb-1 group-hover:text-accent transition-colors" />
                  <span className="text-sm font-extrabold text-foreground">{compareIds.length}</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Comparing</span>
                </div>

                <div
                  onClick={() => { onOpenChange(false); navigate("/my-properties"); }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-secondary/30 border border-border hover:border-primary/50 cursor-pointer transition-all hover:scale-105 group"
                >
                  <Building2 className="h-4 w-4 text-primary mb-1 group-hover:text-accent transition-colors" />
                  <span className="text-sm font-extrabold text-foreground">Active</span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Listings</span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="space-y-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onOpenChange(false); navigate("/my-properties"); }}
                  className="w-full justify-start gap-2 text-xs font-semibold h-9 border-border hover:bg-secondary/60"
                >
                  <Building2 className="h-4 w-4 text-primary" /> Manage My Properties
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onOpenChange(false); navigate("/inquiries"); }}
                  className="w-full justify-start gap-2 text-xs font-semibold h-9 border-border hover:bg-secondary/60"
                >
                  <MessageCircle className="h-4 w-4 text-primary" /> Track Leads & Inquiries
                </Button>
              </div>

              {/* Sign Out CTA */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="w-full gap-2 font-bold text-xs h-9 shadow-sm hover:bg-destructive/90 mt-2"
              >
                <LogOut className="h-3.5 w-3.5" /> Secure Sign Out
              </Button>
            </>
          ) : (
            /* Premium Unauthenticated State */
            <div className="text-center py-4 space-y-4">
              <div className="p-3 bg-primary/10 rounded-xl inline-block">
                <Mail className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Unlock Complete Features</h4>
                <p className="text-xs text-muted-foreground px-4">
                  Sign in or create an account to view saved collections, post real estate listings, and manage inquiries seamlessly.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => { onOpenChange(false); navigate("/auth"); }}
                  className="w-full gap-2 font-bold text-xs h-10 shadow-elevated bg-primary hover:bg-primary/90 text-white"
                >
                  <User className="h-4 w-4" /> Sign In / Register Instantly
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
