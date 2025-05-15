
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PLACEHOLDER_USER } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Parent's Name</Label>
            <Input id="name" defaultValue={PLACEHOLDER_USER.name} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={PLACEHOLDER_USER.email} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="childName">Child's Name</Label>
            <Input id="childName" defaultValue={PLACEHOLDER_USER.childName} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bullyingAlerts" className="flex flex-col space-y-1">
              <span>Bullying Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive notifications for potential bullying incidents.
              </span>
            </Label>
            <Switch id="bullyingAlerts" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="activitySummary" className="flex flex-col space-y-1">
              <span>Weekly Activity Summary</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get a summary of your child's activity each week.
              </span>
            </Label>
            <Switch id="activitySummary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage data sources and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
            <Label htmlFor="googleFit" className="flex flex-col space-y-1">
              <span>Google Fit / Apple Health</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Sync activity and health data.
              </span>
            </Label>
            <Button variant="outline" disabled>Connect (Placeholder)</Button>
          </div>
          <Separator />
           <div className="flex items-center justify-between">
            <Label htmlFor="smsAccess" className="flex flex-col space-y-1">
              <span>SMS/Social Media Monitoring</span>
               <span className="font-normal leading-snug text-muted-foreground">
                Requires explicit consent and platform APIs.
              </span>
            </Label>
            <Button variant="outline" disabled>Configure (Placeholder)</Button>
          </div>
           <Button variant="link" className="p-0 h-auto text-primary">View Privacy Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
}
