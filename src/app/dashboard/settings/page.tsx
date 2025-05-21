"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateProfile } from "@/app/actions/settings";

// Form schema for profile settings
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      jobTitle: "",
    },
  });

  // Fetch user details when session is available
  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        companyName: session.user.companyName || "",
        jobTitle: session.user.jobTitle || "",
      });
    }
  }, [session, profileForm]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const result = await updateProfile(data);
      if (result.success && result.user) {
        // Update the session with the new user data
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            ...result.user,
          },
        });

        // Force a session refresh
        await fetch('/api/auth/session', { method: 'GET' });

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Your job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
            className="gap-4 grid grid-cols-3"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="light"
                className="sr-only peer"
              />
              <Label
                htmlFor="light"
                className="flex flex-col justify-between items-center bg-popover hover:bg-accent p-4 border-2 border-muted [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:border-primary rounded-md hover:text-accent-foreground"
              >
                <Sun className="mb-3 w-6 h-6" />
                Light
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="dark"
                id="dark"
                className="sr-only peer"
              />
              <Label
                htmlFor="dark"
                className="flex flex-col justify-between items-center bg-popover hover:bg-accent p-4 border-2 border-muted [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:border-primary rounded-md hover:text-accent-foreground"
              >
                <Moon className="mb-3 w-6 h-6" />
                Dark
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="system"
                id="system"
                className="sr-only peer"
              />
              <Label
                htmlFor="system"
                className="flex flex-col justify-between items-center bg-popover hover:bg-accent p-4 border-2 border-muted [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:border-primary rounded-md hover:text-accent-foreground"
              >
                <Monitor className="mb-3 w-6 h-6" />
                System
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
} 