import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBusinesses, useCreateBusiness } from "@/hooks/use-businesses";
import { useClusters } from "@/hooks/use-clusters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogScrollArea } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Loader2 } from "lucide-react";

const businessSchema = z.object({
  name: z.string().min(2),
  clusterId: z.coerce.number(),
  category: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.coerce.number().min(1),
  expiryDate: z.string(),
});

type BusinessForm = z.infer<typeof businessSchema>;

export default function AdminBusinesses() {
  const { data: businesses, isLoading } = useBusinesses();
  const { data: clusters } = useClusters();
  const createMutation = useCreateBusiness();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: { discountType: 'PERCENTAGE' }
  });

  const onSubmit = async (data: BusinessForm) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        expiryDate: new Date(data.expiryDate),
        subscriptionStatus: 'ACTIVE',
        discountIsActive: true,
        discountMinPurchase: 0
      });
      toast({ title: "Business Added" });
      setOpen(false);
      reset();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display">Businesses</h1>
          <p className="text-muted-foreground mt-1">Manage participating merchants.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate shadow-md shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Business</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cluster</Label>
                  <select 
                    {...register("clusterId")} 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select Cluster</option>
                    {clusters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.clusterId && <p className="text-xs text-destructive">{errors.clusterId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    {...register("category")}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Salon">Salon</option>
                    <option value="Gym">Gym</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input {...register("ownerName")} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" {...register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <select 
                    {...register("discountType")}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Rate ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input type="number" {...register("discountValue")} />
                </div>
                <div className="space-y-2">
                  <Label>Contract Expiry</Label>
                  <Input type="date" {...register("expiryDate")} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Business"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Discount Rule</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : businesses?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No businesses found.</TableCell></TableRow>
            ) : (
              businesses?.map(business => (
                <TableRow key={business.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div>{business.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">{business.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                      {business.category}
                    </span>
                  </TableCell>
                  <TableCell>{business.ownerName}</TableCell>
                  <TableCell className="font-medium text-primary">
                    {business.discountType === 'PERCENTAGE' ? `${business.discountValue}% OFF` : `$${business.discountValue} OFF`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
