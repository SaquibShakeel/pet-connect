"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Pet = {
  id: string;
  name: string;
  type: string;
  image?: string;
  description?: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
};

export default function ScanPage() {
  const { qrCode } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedNote, setFeedNote] = useState("");

  useEffect(() => {
    if (qrCode) {
      fetchPet();
    }
  }, [qrCode]);

  async function fetchPet() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/scan/${qrCode}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch pet");
      }

      setPet(data.pet);
    } catch (err) {
      console.error("Error fetching pet:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pet");
    } finally {
      setLoading(false);
    }
  }

  async function updateLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const res = await fetch(`/api/scan/${qrCode}/location`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update location");
      }

      setSuccess("Location updated successfully!");
    } catch (err) {
      console.error("Error updating location:", err);
      setError(err instanceof Error ? err.message : "Failed to update location");
    }
  }

  async function handleAddFeed(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const res = await fetch(`/api/scan/${qrCode}/feed`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: feedNote }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add feed");
      }

      setSuccess("Feed record added successfully!");
      setFeedNote("");
    } catch (err) {
      console.error("Error adding feed:", err);
      setError(err instanceof Error ? err.message : "Failed to add feed");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Pet not found</h2>
          <p className="mt-2 text-gray-600">The QR code might be invalid or the pet has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 max-w-4xl">
      <Card className="overflow-hidden border-border/50 shadow-lg dark:shadow-primary/5">
        <div className="relative h-40 sm:h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 dark:from-primary/30 dark:via-primary/20 dark:to-primary/10">
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-end gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg dark:border-background/80 transition-transform hover:scale-105">
                {pet.image ? (
                  <AvatarImage 
                    src={pet.image} 
                    alt={pet.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 dark:bg-primary/20">
                    {pet.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-foreground">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{pet.name}</h1>
                <p className="text-foreground/80 text-sm sm:text-base">{pet.type}</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {success && (
            <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              {success}
            </div>
          )}

          <div className="grid gap-4 sm:gap-6">
            {pet.description && (
              <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors">
                <h3 className="font-semibold text-lg mb-2 text-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  About
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pet.description}</p>
                <div className="mt-4">
                  <Button 
                    onClick={() => router.push(`/pets/${pet.id}/social`)}
                    variant="outline" 
                    className="w-full hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    View Social Profile
                  </Button>
                </div>
              </div>
            )}

            {pet.user && (
              <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors">
                <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Owner
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10 dark:ring-primary/20">
                    {pet.user.image ? (
                      <AvatarImage 
                        src={pet.user.image} 
                        alt={pet.user.name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-sm bg-primary/10 dark:bg-primary/20">
                        {pet.user.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{pet.user.name}</p>
                    <a 
                      href={`/profile/${pet.user.id}`}
                      className="text-sm text-primary hover:text-primary/80 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Location
              </h3>
              <Button 
                onClick={updateLocation} 
                className="w-full hover:bg-primary/90 transition-colors"
              >
                Update Location
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will update {pet.name}'s last known location using your current position.
              </p>
            </div>

            <form onSubmit={handleAddFeed} className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>
                Add Feed Record
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes" className="text-foreground">What did you feed?</Label>
                  <Textarea
                    id="notes"
                    value={feedNote}
                    onChange={(e) => setFeedNote(e.target.value)}
                    placeholder="Enter feeding details..."
                    className="mt-2 bg-background resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full hover:bg-primary/90 transition-colors"
                >
                  Add Feed Record
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 