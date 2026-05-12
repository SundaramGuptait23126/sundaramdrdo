import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface CompareContextType {
  compareIds: string[];
  addCompareId: (id: string) => void;
  removeCompareId: (id: string) => void;
  toggleCompareId: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType>({} as CompareContextType);

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("compareIds");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("compareIds", JSON.stringify(compareIds));
  }, [compareIds]);

  const addCompareId = (id: string) => {
    if (compareIds.includes(id)) {
      toast.info("Property is already in compare list");
      return;
    }
    if (compareIds.length >= 4) {
      toast.error("You can only compare up to 4 properties at a time");
      return;
    }
    setCompareIds((prev) => [...prev, id]);
    toast.success("Added to compare list");
  };

  const removeCompareId = (id: string) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
    toast.success("Removed from compare list");
  };

  const toggleCompareId = (id: string) => {
    if (compareIds.includes(id)) {
      removeCompareId(id);
    } else {
      addCompareId(id);
    }
  };

  const clearCompare = () => {
    setCompareIds([]);
    toast.success("Comparison list cleared");
  };

  return (
    <CompareContext.Provider value={{ compareIds, addCompareId, removeCompareId, toggleCompareId, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
