import stock1 from "@/assets/property-stock-1.jpg";
import stock2 from "@/assets/property-stock-2.jpg";
import stock3 from "@/assets/property-stock-3.jpg";
import stock4 from "@/assets/property-stock-4.jpg";

const stockByType: Record<string, string[]> = {
  flat: [stock1, stock2, stock1],
  villa: [stock2, stock1, stock2],
  commercial: [stock3, stock1, stock3],
  plot: [stock4, stock1, stock4],
};

export function getStockImages(propertyType: string): string[] {
  return stockByType[propertyType] || stockByType.flat;
}

export function getPropertyImage(images: string[] | null | undefined, propertyType: string, index = 0): string {
  if (images && images.length > 0 && images[index]) {
    let img = images[index];
    // Fix localhost URLs from backend
    if (img.includes("localhost:5000")) {
      img = img.replace(/http:\/\/localhost:5000/g, "https://apnaghar-gateway.onrender.com");
    }
    
    // If it's a valid URL or import path, use it
    if (img.startsWith("http") || img.startsWith("/") || img.startsWith("data:") || img.includes("assets")) {
      return img;
    }
  }
  const stocks = getStockImages(propertyType);
  return stocks[index % stocks.length];
}
