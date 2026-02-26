"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons, mockCategories } from "@/data/mock-salons";
import { useState } from "react";

export default function DashboardServicesPage() {
  const { t } = useLocale();
  const salon = mockSalons[0];
  const [dialogOpen, setDialogOpen] = useState(false);

  // Group services by category
  const grouped = salon.services.reduce<Record<string, typeof salon.services>>(
    (acc, service) => {
      const cat = mockCategories.find((c) => c.id === service.categoryId);
      const catName = cat?.name || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(service);
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.services.title}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg gap-1.5 text-sm">
              <Plus className="h-4 w-4" />
              {t.dashboard.services.addService}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.dashboard.services.addService}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
              <div className="space-y-2">
                <Label className="text-sm">{t.dashboard.services.name}</Label>
                <Input placeholder="e.g. Women's Haircut" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t.dashboard.services.category}</Label>
                <Select>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.filter((c) => c.enabled).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t.dashboard.services.duration}</Label>
                <Select>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {t.dashboard.services.durationOptions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t.dashboard.services.price} (€)</Label>
                <Input type="number" placeholder="45" className="h-10 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-lg">
                  {t.common.cancel}
                </Button>
                <Button type="submit" className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg">
                  {t.dashboard.services.save}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([catName, services]) => (
          <div key={catName}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {catName}
            </h2>
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-border/50 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.timeLabel}
                      </span>
                      <span className="text-xs font-medium text-[#C9AA8B]">
                        €{service.price}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
