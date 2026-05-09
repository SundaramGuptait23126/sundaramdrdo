import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

// Local seed data used as fallback when DB is empty
export interface Property {
  id: string;
  title: string;
  description: string;
  listing_type: "sale" | "rent";
  price: number;
  deposit_amount?: number | null;
  lease_duration_months?: number | null;
  availability_status?: string | null;
  city: string;
  locality: string;
  address: string;
  property_type: "flat" | "villa" | "plot" | "commercial";
  bhk: number;
  furnishing_status?: "furnished" | "semi-furnished" | "unfurnished" | null;
  area_sqft: number;
  amenities: string[];
  images: string[];
  owner_id: string;
  status: "active" | "sold" | "rented" | "pending" | "under_review";
  featured: boolean;
  views_count: number;
  ai_score?: number | null;
  predicted_price?: number | null;
  created_at: string;
}

export const seedProperties: Property[] = [
  {
    id: "seed-1", title: "Skyline Penthouse with Panoramic Views", description: "Luxurious 4 BHK penthouse with floor-to-ceiling windows offering breathtaking city views.", listing_type: "sale", price: 25000000, city: "Mumbai", locality: "Worli", address: "The Skyline Towers, Worli Sea Face", property_type: "flat", bhk: 4, area_sqft: 3200, amenities: ["Swimming Pool", "Gym", "Concierge", "Parking"], images: [property1, property2, property3], owner_id: "", status: "active", featured: true, views_count: 1240, ai_score: 94, predicted_price: 24500000, created_at: "2026-02-15",
  },
  {
    id: "seed-2", title: "Modern Villa in Whitefield", description: "Stunning 5 BHK independent villa with landscaped garden and private pool.", listing_type: "sale", price: 18500000, city: "Bangalore", locality: "Whitefield", address: "Prestige Lakeside Habitat", property_type: "villa", bhk: 5, area_sqft: 4500, amenities: ["Private Pool", "Garden", "Gym", "Club House"], images: [property3, property1, property2], owner_id: "", status: "active", featured: true, views_count: 890, ai_score: 91, predicted_price: 19200000, created_at: "2026-02-10",
  },
  {
    id: "seed-3", title: "Cozy 1 BHK for Rent in T. Nagar", description: "Well-maintained 1 BHK apartment ideal for professionals. Close to metro station.", listing_type: "rent", price: 18000, deposit_amount: 100000, lease_duration_months: 11, furnishing_status: "semi-furnished", city: "Chennai", locality: "T. Nagar", address: "Green Park Apartments", property_type: "flat", bhk: 1, area_sqft: 550, amenities: ["Lift", "Security", "Water Supply"], images: [property2, property3, property1], owner_id: "", status: "active", featured: false, views_count: 320, ai_score: 78, predicted_price: 17500, created_at: "2026-02-20",
  },
  {
    id: "seed-4", title: "Spacious 2 BHK Rental in Gachibowli", description: "Fully furnished 2 BHK with modern interiors and balcony. Walking distance to IT park.", listing_type: "rent", price: 28000, deposit_amount: 200000, lease_duration_months: 12, furnishing_status: "furnished", city: "Hyderabad", locality: "Gachibowli", address: "Cyber Heights, Gachibowli", property_type: "flat", bhk: 2, area_sqft: 1100, amenities: ["Gym", "Parking", "Power Backup", "Wi-Fi"], images: [property1, property3, property2], owner_id: "", status: "active", featured: true, views_count: 560, ai_score: 85, predicted_price: 27000, created_at: "2026-02-18",
  },
  {
    id: "seed-5", title: "Premium Office Space in Hinjewadi", description: "Ready-to-move commercial office space with modern interiors and central AC.", listing_type: "rent", price: 95000, deposit_amount: 500000, lease_duration_months: 36, city: "Pune", locality: "Hinjewadi", address: "IT Park Phase 2, Hinjewadi", property_type: "commercial", bhk: 0, area_sqft: 3000, amenities: ["Central AC", "Parking", "Cafeteria", "High Speed Internet"], images: [property3, property2, property1], owner_id: "", status: "active", featured: false, views_count: 210, ai_score: 80, predicted_price: 92000, created_at: "2026-02-12",
  },
  {
    id: "seed-6", title: "Residential Plot in Dwarka", description: "Premium residential plot in DDA-approved layout. Perfect for building your dream home.", listing_type: "sale", price: 12000000, city: "Delhi", locality: "Dwarka", address: "Sector 21, Dwarka", property_type: "plot", bhk: 0, area_sqft: 2400, amenities: ["Gated Community", "Park", "Water Supply"], images: [property2, property1, property3], owner_id: "", status: "active", featured: false, views_count: 180, ai_score: 76, predicted_price: 12500000, created_at: "2026-02-08",
  },
  {
    id: "seed-7", title: "Luxury 4 BHK Sea-Facing Villa", description: "Exquisite villa with private beach access, infinity pool, and tropical gardens.", listing_type: "sale", price: 45000000, city: "Goa", locality: "Calangute", address: "Beachfront Villas, Calangute", property_type: "villa", bhk: 4, area_sqft: 5500, amenities: ["Private Pool", "Beach Access", "Garden", "Smart Home", "Spa"], images: [property1, property2, property3], owner_id: "", status: "active", featured: true, views_count: 1580, ai_score: 96, predicted_price: 44000000, created_at: "2026-02-22",
  },
  {
    id: "seed-8", title: "Studio Apartment for Rent in Sector 62", description: "Compact studio with modular kitchen, perfect for students and working professionals.", listing_type: "rent", price: 12000, deposit_amount: 50000, lease_duration_months: 6, furnishing_status: "furnished", city: "Noida", locality: "Sector 62", address: "Metro View Apartments", property_type: "flat", bhk: 1, area_sqft: 400, amenities: ["Metro Nearby", "Security", "Parking"], images: [property3, property1, property2], owner_id: "", status: "active", featured: false, views_count: 430, ai_score: 72, predicted_price: 11500, created_at: "2026-02-16",
  },
  {
    id: "seed-9", title: "Elegant 3 BHK in Salt Lake", description: "Beautifully designed apartment in a premium society with excellent connectivity.", listing_type: "sale", price: 9500000, city: "Kolkata", locality: "Salt Lake", address: "Urbanville, Sector V", property_type: "flat", bhk: 3, area_sqft: 1650, amenities: ["Swimming Pool", "Gym", "Club House", "Children Play Area"], images: [property2, property3, property1], owner_id: "", status: "active", featured: false, views_count: 340, ai_score: 83, predicted_price: 9200000, created_at: "2026-02-14",
  },
  {
    id: "seed-10", title: "Furnished 2 BHK for Rent in SG Highway", description: "Fully furnished flat with AC in all rooms, modular kitchen, and society amenities.", listing_type: "rent", price: 22000, deposit_amount: 150000, lease_duration_months: 12, furnishing_status: "furnished", city: "Ahmedabad", locality: "SG Highway", address: "Riviera Heights, SG Highway", property_type: "flat", bhk: 2, area_sqft: 1050, amenities: ["AC", "Modular Kitchen", "Gym", "Garden", "Security"], images: [property1, property2, property3], owner_id: "", status: "active", featured: false, views_count: 290, ai_score: 81, predicted_price: 21000, created_at: "2026-02-19",
  },
];

export const cities = ["Mumbai", "Bangalore", "Gurugram", "Pune", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Goa", "Noida", "Ahmedabad"];
export const propertyTypes = ["flat", "villa", "plot", "commercial"] as const;
export const bhkOptions = [1, 2, 3, 4, 5];

export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("en-IN")} sq.ft`;
}
