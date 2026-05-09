import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Maximize, BedDouble, Brain, TrendingUp, IndianRupee, Heart, ChevronLeft, ChevronRight, Shield, User, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Property, formatPrice, formatArea } from "@/lib/mockData";
import { getPropertyImage } from "@/lib/stockImages";

interface Props {
  property: Property;
  layout?: "grid" | "list";
}

const PropertyCard = ({ property, layout = "grid" }: Props) => {
  const [liked, setLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const typeLabels: Record<string, string> = { flat: "Apartment", villa: "Villa", plot: "Plot", commercial: "Commercial" };
  const isRental = property.listing_type === "rent";
  const imgSrc = getPropertyImage(property.images, property.property_type, imgIdx);
  const totalImages = property.images && property.images.length > 0 ? property.images.length : 3;
  const pricePerSqft = property.area_sqft > 0 ? Math.round(property.price / property.area_sqft) : null;
  const daysSincePosted = Math.max(1, Math.floor((Date.now() - new Date(property.created_at).getTime()) / 86400000));

  if (layout === "list") {
    return (
      <div className="group relative">
        <Link to={`/property/${property.id}`} className="block">
          <div className="flex overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:shadow-elevated">
            <div className="relative w-72 shrink-0 overflow-hidden">
              <img src={imgSrc} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                {property.featured && <Badge className="bg-warning text-warning-foreground border-0 text-[10px] font-semibold px-2 py-0.5">⭐ Premium</Badge>}
                <Badge className={`border-0 text-[10px] font-semibold px-2 py-0.5 ${isRental ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                  {isRental ? "Rent" : "Sale"}
                </Badge>
              </div>
              <div className="absolute right-2.5 top-2.5 rounded-full bg-foreground/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">📷 {totalImages}</div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">{property.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{property.locality}, {property.city}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[9px] px-1.5 py-0 gap-0.5"><Shield className="h-2.5 w-2.5 text-success" /> Verified</Badge>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-display text-xl font-bold text-foreground">{formatPrice(property.price)}{isRental ? "/mo" : ""}</p>
                {pricePerSqft && !isRental && <span className="text-xs text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sq.ft</span>}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {property.bhk > 0 && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.bhk} BHK</span>}
                <span className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {formatArea(property.area_sqft)}</span>
                {isRental && property.furnishing_status && <span className="capitalize">{property.furnishing_status}</span>}
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {property.views_count}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-2">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><User className="h-3 w-3" /> Owner</span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> {daysSincePosted}d ago</span>
              </div>
            </div>
          </div>
        </Link>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
          <Heart className={`h-4 w-4 transition-colors ${liked ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link to={`/property/${property.id}`} className="block">
        <div className="overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:shadow-elevated">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={imgSrc} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy" width={400} height={300} onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
            {totalImages > 1 && (
              <>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx((i) => (i - 1 + totalImages) % totalImages); }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx((i) => (i + 1) % totalImages); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {Array.from({ length: Math.min(totalImages, 5) }).map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === imgIdx % 5 ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
            <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
              {property.featured && <Badge className="bg-warning text-warning-foreground border-0 text-[10px] font-semibold px-2 py-0.5">⭐ Premium</Badge>}
              {property.status === "active" && <Badge className="bg-success text-success-foreground border-0 text-[10px] font-semibold px-2 py-0.5">Ready To Move</Badge>}
              <Badge className={`border-0 text-[10px] font-semibold px-2 py-0.5 ${isRental ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                {isRental ? "Rent" : "Sale"}
              </Badge>
            </div>
            {property.ai_score && (
              <div className="absolute right-2.5 bottom-8 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                <Brain className="h-3 w-3 text-ai" /><span>{property.ai_score}%</span>
              </div>
            )}
            <div className="absolute right-2.5 top-2.5 rounded-full bg-foreground/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">📷 {totalImages}</div>
          </div>

          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
              <Badge variant="outline" className="shrink-0 text-[9px] px-1.5 py-0 gap-0.5"><Shield className="h-2.5 w-2.5 text-success" /> Verified</Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {property.bhk > 0 && <><span>{property.bhk} BHK {typeLabels[property.property_type]}</span><span>in</span></>}
              <span className="truncate">{property.locality}, {property.city}</span>
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="font-display text-lg font-bold text-foreground">{formatPrice(property.price)}{isRental ? "/mo" : ""}</p>
              {pricePerSqft && !isRental && <span className="text-[10px] text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sq.ft</span>}
            </div>
            {property.predicted_price && (
              <p className="flex items-center gap-1 text-[10px] text-ai font-medium">
                <TrendingUp className="h-3 w-3" /> AI Estimate: {formatPrice(property.predicted_price)}{isRental ? "/mo" : ""}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {property.bhk > 0 && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.bhk} BHK</span>}
              <span className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {formatArea(property.area_sqft)}</span>
              {isRental && property.furnishing_status && <span className="capitalize">{property.furnishing_status}</span>}
            </div>
            {isRental && property.deposit_amount && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <IndianRupee className="h-3 w-3" /> Deposit: {formatPrice(property.deposit_amount)}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><User className="h-3 w-3" /> Owner</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {daysSincePosted}d ago
              </span>
            </div>
          </div>
        </div>
      </Link>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
        <Heart className={`h-4 w-4 transition-colors ${liked ? "fill-accent text-accent" : "text-muted-foreground"}`} />
      </button>
    </div>
  );
};

export default PropertyCard;
