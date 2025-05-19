
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, WifiOff, Loader2, UploadCloud } from "lucide-react"; 
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState, useRef } from "react";
import { updateProfile } from "firebase/auth";
// import { auth } from "@/lib/firebase/config"; // auth is available from useAuth if needed directly
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .csv file.",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          try {
            localStorage.setItem('guardianAngelCsvActivityData', text);
            toast({
              title: "File Uploaded",
              description: `${file.name} has been uploaded. Dashboard will reflect this data.`,
            });
          } catch (err) {
             toast({
              title: "Storage Error",
              description: "Could not save data to local storage. It might be full.",
              variant: "destructive",
            });
          }
        }
         if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input after processing
        }
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
         if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      };
      reader.readAsText(file);
    }
  };

  const isHealthConnectSimulated = true; 

  if (authLoading || !currentUser) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        {[...Array(4)].map((_, i) => ( // Increased to 4 cards for new upload section
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
        <p className="text-muted-foreground">Manage your account, app preferences, and data.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent's Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled /> 
                    </FormControl>
                    <FormMessage />
                     <p className="text-xs text-muted-foreground pt-1">Email address cannot be changed here.</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Activity Data (CSV)</CardTitle>
          <CardDescription>
            Upload a CSV file with activity data. Expected columns: Date, Steps, Calories, Distance, ActiveMinutes.
            The dashboard will use the latest entry from this file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="csvUpload">CSV File</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="csvUpload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Example CSV format: <br />
            Date,Steps,Calories,Distance,ActiveMinutes<br />
            2023-10-26,8000,300,5.5,60
          </p>
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
           <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="healthAlerts" className="flex flex-col space-y-1">
              <span>Critical Health Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Notifications for unusual health readings (e.g., very high heart rate).
              </span>
            </Label>
            <Switch id="healthAlerts" defaultChecked />
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
            <Label htmlFor="healthConnect" className="flex flex-col space-y-1">
              <span>Health Connect (Simulated)</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Sync activity and health data from smartwatch via phone.
              </span>
            </Label>
            {isHealthConnectSimulated ? (
              <Button variant="outline" disabled className="cursor-not-allowed">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Connected (Simulated)
              </Button>
            ) : (
               <Button variant="outline" disabled>
                <WifiOff className="mr-2 h-4 w-4" />
                Connect (Placeholder)
              </Button>
            )}
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
