import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Bookmark } from "lucide-react";
import ProfileModal from "./ProfileModal";

const MobileBottomNav = () => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border py-1.5 px-3 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around">
          {/* Home Link */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive("/")
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <Home className={`h-5 w-5 ${isActive("/") ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className="text-[10px] tracking-tight">Home</span>
          </Link>

          {/* Search Link */}
          <Link
            to="/properties"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive("/properties")
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <Search className={`h-5 w-5 ${isActive("/properties") ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className="text-[10px] tracking-tight">Search</span>
          </Link>

          {/* Profile Trigger Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isProfileOpen
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <User className={`h-5 w-5 ${isProfileOpen ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>

          {/* Saved Link */}
          <Link
            to="/saved"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive("/saved")
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isActive("/saved") ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className="text-[10px] tracking-tight">Saved</span>
          </Link>
        </div>
      </div>

      {/* Embedded Comprehensive Profile Modal */}
      <ProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
};

export default MobileBottomNav;
