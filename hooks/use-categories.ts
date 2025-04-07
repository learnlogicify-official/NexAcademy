import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategoryCount() {
  return useQuery<{ count: number }>({
    queryKey: ["categories", "count"],
    queryFn: async () => {
      const response = await fetch("/api/categories/count");
      if (!response.ok) {
        throw new Error("Failed to fetch category count");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 