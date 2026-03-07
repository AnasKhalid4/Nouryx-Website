"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import type { CategoryModel } from "@/types/category";

export function useCategories() {
    return useQuery<CategoryModel[]>({
        queryKey: queryKeys.categories.enabled(),
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 30, // Cached for 30 minutes — categories rarely change
    });
}
