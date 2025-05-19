
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, WifiOff, Loader2, Power, PowerOff } from "lucide-react"; // Removed UploadCloud
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react"; // Removed useRef
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const settingsFormSchema = z.object({
  parentName: z.string().min(1, "Parent's name cannot be empty."),
  email: z.string().email("Invalid email address.").optional(),
  childName: z.string().min(1, "Child's name cannot be empty."),
});

type SettingsFormInputs = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { currentUser, childNameContext, setChildNameContext, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormInputs>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      parentName: "",
      email: "",
      childName: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        parentName: currentUser.displayName || "",
        email: currentUser.email || "",
        childName: childNameContext || "",
      });
    }
  }, [currentUser, childNameContext, form]);

  const onSubmit = async (data: SettingsFormInputs) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to save settings.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      if (data.parentName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: data.parentName });
      }
      setChildNameContext(data.childName); 
      toast({ title: "Success", description: "Profile settings saved successfully!" });
    } catch (error: any) {
      toast({ title: "Error Saving Settings", description: error.message || "Could not save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isFitbitConnectedSimulated = true; 

  if (authLoading || !currentUser) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        {[...Array(3)].map((_, i) => ( // Was 4, reduced to 3 cards as CSV upload is removed
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, app preferences, and data connections.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="parentName" render={({ field }) => (<FormItem><FormLabel>Parent's Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /><p className="text-xs text-muted-foreground pt-1">Email address cannot be changed here.</p></FormItem>)} />
              <FormField control={form.control} name="childName" render={({ field }) => (<FormItem><FormLabel>Child's Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      {/* CSV Upload Card has been removed */}

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive alerts and updates (UI placeholders).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label htmlFor="aiAlerts" className="flex flex-col space-y-1"><span>Bullying &amp; Depressive Content Alerts</span><span className="font-normal leading-snug text-muted-foreground">Receive notifications for AI-detected concerns.</span></Label><Switch id="aiAlerts" defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label htmlFor="healthAlerts" className="flex flex-col space-y-1"><span>Fitbit Health Threshold Alerts</span><span className="font-normal leading-snug text-muted-foreground">Notifications for unusual health readings from Fitbit.</span></Label><Switch id="healthAlerts" defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label htmlFor="activitySummary" className="flex flex-col space-y-1"><span>Weekly Activity Summary</span><span className="font-normal leading-snug text-muted-foreground">Get a summary of your child's activity each week.</span></Label><Switch id="activitySummary" /></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Connections & Privacy</CardTitle>
          <CardDescription>Manage data sources and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
            <Label htmlFor="fitbitConnect" className="flex flex-col space-y-1">
              <span>Fitbit Integration</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Sync activity and health data from your child's Fitbit device.
              </span>
            </Label>
            {isFitbitConnectedSimulated ? (
              <Button variant="outline" disabled className="cursor-not-allowed">
                <Power className="mr-2 h-4 w-4 text-green-500" /> {/* Icon changed to Power */}
                Connected (Simulated via Mock API)
              </Button>
            ) : (
               <Button variant="outline" > {/* Potentially enable this for OAuth flow later */}
                <PowerOff className="mr-2 h-4 w-4" />  {/* Icon changed to PowerOff */}
                Connect to Fitbit (Placeholder)
              </Button>
            )}
          </div>
          <Separator />
           <div className="flex items-center justify-between">
            <Label htmlFor="smsAccess" className="flex flex-col space-y-1"><span>SMS/Social Media Monitoring</span><span className="font-normal leading-snug text-muted-foreground">Requires explicit consent and platform APIs.</span></Label>
            <Button variant="outline" disabled>Configure (Placeholder)</Button>
          </div>
           <Button variant="link" className="p-0 h-auto text-primary">View Privacy Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
}
