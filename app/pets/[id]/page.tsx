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
import { Calendar, Clock, MapPin, PawPrint, Pencil, Trash2, Share2, Camera, ImagePlus } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      setUploading(true);
      setError("");

      let imageUrl = editedPet.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "pet_connect");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/dp0ujlbby/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const { secure_url } = await uploadRes.json();
        imageUrl = secure_url;
      }

      const res = await fetch(`/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editedPet, image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setIsEditDialogOpen(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pet");
    } finally {
      setUploading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
            <div className="h-20 w-20 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg shadow-sm">
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
            <PawPrint className="h-16 w-16 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Pet not found</h2>
          <p className="text-muted-foreground mb-6">The pet you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/pets")} className="w-full sm:w-auto">
            Back to Pets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              {pet.image ? (
                <AvatarImage 
                  src={pet.image} 
                  alt={pet.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-3xl bg-primary/10">
                  {pet.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold tracking-tight">{pet.name}</h1>
                  <p className="text-xl text-muted-foreground">{pet.type}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/pets/${id}/social`)}
                    className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Social Feed
                  </Button>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Edit Pet Profile</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdatePet} className="space-y-6 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-base">Name</Label>
                          <Input
                            id="name"
                            value={editedPet.name || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, name: e.target.value })}
                            required
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-base">Type</Label>
                          <Input
                            id="type"
                            value={editedPet.type || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, type: e.target.value })}
                            required
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-base">Description</Label>
                          <Textarea
                            id="description"
                            value={editedPet.description || ""}
                            onChange={(e) => setEditedPet({ ...editedPet, description: e.target.value })}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image" className="text-base">Pet Image</Label>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("image")?.click()}
                                className="w-full"
                              >
                                <ImagePlus className="h-4 w-4 mr-2" />
                                {imageFile ? "Change Image" : "Select Image"}
                              </Button>
                            </div>
                            {imagePreview && (
                              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsEditDialogOpen(false);
                              setImageFile(null);
                              setImagePreview(null);
                            }} 
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="px-6"
                            disabled={uploading}
                          >
                            {uploading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2 hover:bg-destructive/90 transition-colors">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          This action cannot be undone. This will permanently delete {pet.name}'s profile
                          and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="hover:bg-primary hover:text-primary-foreground transition-colors">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePet} className="bg-destructive hover:bg-destructive/90 px-6">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {pet.description && (
                <p className="text-muted-foreground text-lg mt-4 max-w-2xl leading-relaxed">{pet.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">QR Code</CardTitle>
              <CardDescription className="text-base">Scan this code to view {pet.name}'s profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
                <QRCodeSVG 
                  value={`${window.location.origin}/scan/${pet.qrCode}`} 
                  size={240}
                  bgColor="transparent"
                  fgColor="currentColor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Feeding History */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Last Feeding</CardTitle>
              <CardDescription className="text-base">Most recent feeding record for {pet.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.feeds?.length > 0 ? (
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <Clock className="h-6 w-6 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-base font-medium">
                      {format(new Date(pet.feeds[0].timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {pet.feeds[0].notes && (
                      <p className="text-base text-muted-foreground">{pet.feeds[0].notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-base text-muted-foreground text-center py-6">No feeding history yet</p>
              )}
            </CardContent>
          </Card>

          {/* Location History */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Last Location</CardTitle>
              <CardDescription className="text-base">Most recent location where {pet.name} has been</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.locations?.length > 0 ? (
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <MapPin className="h-6 w-6 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-base font-medium">
                      {format(new Date(pet.locations[0].timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-base text-muted-foreground">
                      Latitude: {pet.locations[0].latitude}, Longitude: {pet.locations[0].longitude}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.open(`https://www.google.com/maps?q=${pet.locations[0].latitude},${pet.locations[0].longitude}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-base text-muted-foreground text-center py-6">No location history yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}