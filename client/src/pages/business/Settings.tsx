import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { data: profile } = useProfile();

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and business preferences.</p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Update your public-facing business details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input defaultValue={profile?.business?.name || ""} disabled />
              <p className="text-xs text-muted-foreground">Contact admin to change legal name.</p>
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input defaultValue={profile?.business?.email || ""} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input defaultValue={profile?.business?.phone || ""} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input defaultValue={profile?.business?.category || ""} disabled />
            </div>
          </div>
          <Button className="font-medium hover-elevate">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Discount Configuration</CardTitle>
          <CardDescription>View your current cluster-wide discount rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 p-6 rounded-xl border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-lg font-bold mt-1">{profile?.business?.discountType || 'PERCENTAGE'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Value</p>
              <p className="text-lg font-bold mt-1 text-primary">
                {profile?.business?.discountType === 'PERCENTAGE' ? `${profile?.business?.discountValue || 0}%` : `$${profile?.business?.discountValue || 0}`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Min Purchase</p>
              <p className="text-lg font-bold mt-1">${profile?.business?.discountMinPurchase || 0}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Discount rules are managed by your Cluster Admin. Please contact them for modifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
