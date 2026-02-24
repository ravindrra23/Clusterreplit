import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIssueCoupon } from "@/hooks/use-coupons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Users, Printer, Mail, Loader2 } from "lucide-react";

const issueSchema = z.object({
  isBulk: z.boolean().default(false),
  count: z.coerce.number().min(1).max(500).default(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

type IssueForm = z.infer<typeof issueSchema>;

export default function IssueCoupon() {
  const { toast } = useToast();
  const issueMutation = useIssueCoupon();
  const [isBulk, setIsBulk] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: { isBulk: false, count: 1 }
  });

  const onSubmit = async (data: IssueForm) => {
    try {
      await issueMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: data.isBulk ? `Generated ${data.count} coupons successfully.` : "Coupon issued and sent successfully.",
      });
      // reset form mostly handled or redirect
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display">Issue Coupons</h1>
        <p className="text-muted-foreground mt-1">Generate new discounts for your cluster network.</p>
      </div>

      <Card className="border-border/60 shadow-lg shadow-black/5 hover-elevate">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Generation Mode</CardTitle>
              <CardDescription className="mt-1">Choose how you want to distribute coupons.</CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-background p-2 rounded-lg border border-border shadow-sm">
              <Label htmlFor="mode" className={`cursor-pointer ${!isBulk ? 'text-primary font-bold' : 'text-muted-foreground'}`}>Single</Label>
              <Switch 
                id="mode" 
                checked={isBulk} 
                onCheckedChange={(c) => { setIsBulk(c); setValue('isBulk', c); }} 
              />
              <Label htmlFor="mode" className={`cursor-pointer ${isBulk ? 'text-primary font-bold' : 'text-muted-foreground'}`}>Bulk Print</Label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {isBulk ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex items-start gap-4">
                  <Printer className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Bulk Print Mode</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Generate multiple anonymized coupons to print and hand out at your register. These are unassigned until redeemed.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">Number of coupons to generate (Max 500)</Label>
                  <Input 
                    id="count" 
                    type="number" 
                    className="max-w-xs h-12 text-lg" 
                    {...register("count")} 
                  />
                  {errors.count && <p className="text-sm text-destructive">{errors.count.message}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Direct Issue Mode</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Send a specific coupon directly to a customer via email or SMS. Great for personalized follow-ups.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name (Optional)</Label>
                    <Input id="customerName" placeholder="Jane Doe" className="h-12" {...register("customerName")} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input id="customerPhone" placeholder="+1 (555) 000-0000" className="h-12" {...register("customerPhone")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input id="customerEmail" type="email" placeholder="jane@example.com" className="h-12" {...register("customerEmail")} />
                    {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail.message}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/50">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto min-w-[200px] h-12 font-medium shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                disabled={issueMutation.isPending}
              >
                {issueMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Ticket className="w-4 h-4 mr-2" /> {isBulk ? 'Generate Bulk Coupons' : 'Issue & Send Coupon'}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
