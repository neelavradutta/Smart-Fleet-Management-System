"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  sidebarOpen: boolean;
  selectedVehicleId: string | null;
  toggleSidebar: () => void;
  selectVehicle: (id: string | null) => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      selectedVehicleId: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      selectVehicle: (id) => set({ selectedVehicleId: id }),
    }),
    { name: "sfms-ui" },
  ),
);
