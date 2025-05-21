"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, PawPrint, Pencil, Trash2, Share2, Camera } from "lucide-react";
import { format } from "date-fns";

type Pet = {
  id: string;
  name: string;
  type: string;
  description?: string;
  qrCode: string;
  image?: string;
  locations: Location[];
  feeds: Feed[];
};

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Feed = {
  id: string;
  timestamp: string;
  notes?: string;
};

export default function PetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedNote, setFeedNote] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPet, setEditedPet] = useState<Partial<Pet>>({});

  useEffect(() => {
    fetchPet();
  }, [id]);

  async function fetchPet() {
    try {
      const res = await fetch(`/api/pets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setEditedPet(data.pet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pet");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFeed(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pets/${id}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: feedNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setFeedNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    }
  }

  async function handleUpdatePet(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedPet),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pet");
    }
  }

  async function handleDeletePet() {
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete pet");
      router.push("/pets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pet");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <PawPrint className="h-16 w-16 mx-auto text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pet not found</h2>
          <p className="text-gray-600 mb-6">The pet you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/pets")} className="w-full sm:w-auto">
            Back to Pets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              {pet.image ? (
                <AvatarImage 
                  src={pet.image} 
                  alt={pet.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-2xl bg-primary/10">
                  {pet.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{pet.type}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/pets/${id}/social`)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Social Feed
                  </Button>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Pet Profile</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdatePet} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editedPet.name || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Input
                            id="type"
                            value={editedPet.type || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, type: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editedPet.description || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="image"
                              type="url"
                              value={editedPet.image || ""}
                              onChange={(e) => setEditedPet({ ...editedPet, image: e.target.value })}
                              placeholder="https://example.com/pet-image.jpg"
                            />
                            <Button type="button" variant="outline" className="shrink-0">
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete {pet.name}'s profile
                          and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePet} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {pet.description && (
                <p className="text-gray-600 mt-4 max-w-2xl">{pet.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan this code to view {pet.name}'s profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG 
                  value={`${window.location.origin}/scan/${pet.qrCode}`} 
                  size={200} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Feeding History */}
          <Card>
            <CardHeader>
              <CardTitle>Last Feeding</CardTitle>
              <CardDescription>Most recent feeding record for {pet.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.feeds?.length > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(pet.feeds[0].timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {pet.feeds[0].notes && (
                      <p className="text-sm text-gray-600 mt-1">{pet.feeds[0].notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No feeding history yet</p>
              )}
            </CardContent>
          </Card>

          {/* Location History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Last Location</CardTitle>
              <CardDescription>Most recent location where {pet.name} has been</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.locations?.length > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(pet.locations[0].timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Latitude: {pet.locations[0].latitude}, Longitude: {pet.locations[0].longitude}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No location history yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 