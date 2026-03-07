"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useSalonServices } from "@/hooks/use-salons";
import { useCategories } from "@/hooks/use-categories";
import { addSalonService, updateSalonService, deleteSalonService } from "@/lib/firebase/firestore";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export default function DashboardServicesPage() {
  const { t } = useLocale();
  const { uid } = useAuth();
  const { data: services, isLoading: servicesLoading } = useSalonServices(uid || "");
  const { data: categories, isLoading: catsLoading } = useCategories();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormCategory("");
    setFormDuration("");
    setFormPrice("");
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (service: { id: string; name: string; categoryId: string; minutes: number; price: number }) => {
    setEditingId(service.id);
    setFormName(service.name);
    setFormCategory(service.categoryId);
    setFormDuration(String(service.minutes));
    setFormPrice(String(service.price));
    setDialogOpen(true);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    if (!formName || !formCategory || !formDuration || !formPrice) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      const minutes = parseInt(formDuration);
      const timeLabel = minutes >= 60
        ? `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? `${minutes % 60}min` : ""}`
        : `${minutes} min`;

      const data = {
        name: formName,
        categoryId: formCategory,
        providerId: uid,
        minutes,
        timeLabel: timeLabel.trim(),
        price: parseFloat(formPrice),
      };

      if (editingId) {
        await updateSalonService(uid, editingId, data);
        toast.success("Service updated");
      } else {
        const serviceId = `srv_${Date.now()}`;
        await addSalonService(uid, serviceId, data);
        toast.success("Service added");
      }

      // Refresh services
      queryClient.invalidateQueries({ queryKey: queryKeys.salons.services(uid) });
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save service");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [uid, formName, formCategory, formDuration, formPrice, editingId, queryClient]);

  const handleDelete = useCallback(async (serviceId: string) => {
    if (!uid) return;
    if (!confirm("Delete this service?")) return;

    try {
      await deleteSalonService(uid, serviceId);
      queryClient.invalidateQueries({ queryKey: queryKeys.salons.services(uid) });
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  }, [uid, queryClient]);

  // Group services by category
  const enabledCategories = (categories || []).filter((c) => c.enabled);
  const catMap = new Map(enabledCategories.map((c) => [c.id, c.name]));

  const grouped = (services || []).reduce<Record<string, typeof services>>((acc, service) => {
    const catName = catMap.get(service.categoryId) || "Other";
    if (!acc[catName]) acc[catName] = [];
    acc[catName]!.push(service);
    return acc;
  }, {});

  const isLoading = servicesLoading || catsLoading;

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t.dashboard.services.title}</h1>
        <Button className="w-full sm:w-auto bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg gap-1.5 text-sm h-10" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t.dashboard.services.addService}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Service" : t.dashboard.services.addService}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm">{t.dashboard.services.name}</Label>
              <Input placeholder="e.g. Women's Haircut" className="h-10 rounded-lg" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t.dashboard.services.category}</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {enabledCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t.dashboard.services.duration}</Label>
              <Select value={formDuration} onValueChange={setFormDuration}>
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {["15", "30", "45", "60", "90", "120"].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t.dashboard.services.price} (€)</Label>
              <Input type="number" placeholder="45" className="h-10 rounded-lg" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:flex-1 rounded-lg h-10">
                {t.common.cancel}
              </Button>
              <Button type="submit" className="w-full sm:flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg h-10" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Update" : t.dashboard.services.save)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No services yet. Add your first service!
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([catName, catServices]) => (
            <div key={catName}>
              <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 md:mb-3">
                {catName}
              </h2>
              <div className="space-y-2">
                {catServices!.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl border border-border/50 p-3 md:p-4 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {service.timeLabel || `${service.minutes} min`}
                        </span>
                        <span className="text-xs font-medium text-[#C9AA8B]">
                          €{service.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => openEdit(service)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
      }
    </div >
  );
}
