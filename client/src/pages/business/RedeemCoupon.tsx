import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRedeemCoupon } from "@/hooks/use-coupons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScanLine, Loader2, CheckCircle2 } from "lucide-react";

const redeemSchema = z.object({
  code: z.string().min(4, "Code is too short").max(20),
  transactionValue: z.coerce.number().min(0.01, "Value must be positive"),
});

type RedeemForm = z.infer<typeof redeemSchema>;

export default function RedeemCoupon() {
  const { toast } = useToast();
  const redeemMutation = useRedeemCoupon();
  const [successData, setSuccessData] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RedeemForm>({
    resolver: zodResolver(redeemSchema),
  });

  const onSubmit = async (data: RedeemForm) => {
    setSuccessData(null);
    try {
      const res = await redeemMutation.mutateAsync(data);
      setSuccessData(res);
      toast({
        title: "Coupon Redeemed!",
        description: "Transaction recorded successfully.",
        variant: "default",
      });
      reset();
    } catch (err: any) {
      toast({
        title: "Invalid Coupon",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex bg-primary/10 p-4 rounded-full mb-2">
          <ScanLine className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Redeem Coupon</h1>
        <p className="text-muted-foreground text-lg">Process a customer's cluster coupon to apply their discount.</p>
      </div>

      {successData && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl animate-in zoom-in-95 duration-300 flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 text-lg">Redemption Successful</h3>
            <p className="text-emerald-600/80 dark:text-emerald-500/80 mt-1">Discount applied and recorded.</p>
            {successData.discountApplied && (
              <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg inline-block">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Discount Amount:</span>
                <span className="ml-2 font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  ${successData.discountApplied.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <Card className="border-border/60 shadow-xl shadow-black/5">
        <CardContent className="pt-8 pb-8 px-6 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-base">Coupon Code</Label>
              <Input 
                id="code" 
                placeholder="e.g. CLSTR-ABCD-1234" 
                className="h-14 text-xl font-mono text-center uppercase tracking-widest bg-muted/30 focus:bg-background transition-colors" 
                {...register("code")} 
              />
              {errors.code && <p className="text-sm text-destructive text-center">{errors.code.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="transactionValue" className="text-base">Total Transaction Value ($)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-muted-foreground text-lg">$</span>
                </div>
                <Input 
                  id="transactionValue" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="h-14 text-lg pl-8" 
                  {...register("transactionValue")} 
                />
              </div>
              {errors.transactionValue && <p className="text-sm text-destructive">{errors.transactionValue.message}</p>}
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                "Verify & Redeem"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
