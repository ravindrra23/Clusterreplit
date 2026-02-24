import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClusters, useCreateCluster } from "@/hooks/use-clusters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Map, Loader2 } from "lucide-react";
import { format } from "date-fns";

const clusterSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  expiryDate: z.string(), // date string
});

type ClusterForm = z.infer<typeof clusterSchema>;

export default function AdminClusters() {
  const { data: clusters, isLoading } = useClusters();
  const createMutation = useCreateCluster();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClusterForm>({
    resolver: zodResolver(clusterSchema),
  });

  const onSubmit = async (data: ClusterForm) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        expiryDate: new Date(data.expiryDate),
        status: 'ACTIVE'
      });
      toast({ title: "Cluster Created" });
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
          <h1 className="text-3xl font-bold font-display">Clusters</h1>
          <p className="text-muted-foreground mt-1">Manage geographic business networks.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate shadow-md shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Cluster</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Cluster Name</Label>
                <Input {...register("name")} placeholder="Downtown Retail Hub" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>City / Region</Label>
                <Input {...register("city")} placeholder="Seattle, WA" />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" {...register("expiryDate")} />
                {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Cluster"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : clusters?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No clusters found.</TableCell></TableRow>
            ) : (
              clusters?.map(cluster => (
                <TableRow key={cluster.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-primary/70" />
                      {cluster.name}
                    </div>
                  </TableCell>
                  <TableCell>{cluster.city}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {cluster.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(cluster.expiryDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
