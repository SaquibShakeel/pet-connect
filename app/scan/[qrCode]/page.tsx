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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            {pet.image ? (
              <AvatarImage 
                src={pet.image} 
                alt={pet.name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg bg-primary/10">
                {pet.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>{pet.name}</CardTitle>
            <p className="text-sm text-gray-500">Type: {pet.type}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div>
            <Button onClick={updateLocation} className="w-full">
              Update Location
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This will update {pet.name}'s last known location using your current position.
            </p>
          </div>

          <form onSubmit={handleAddFeed} className="space-y-4">
            <div>
              <Label htmlFor="notes">Add Feed Record</Label>
              <Textarea
                id="notes"
                value={feedNote}
                onChange={(e) => setFeedNote(e.target.value)}
                placeholder="What did you feed?"
              />
            </div>
            <Button type="submit" className="w-full">
              Add Feed Record
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 