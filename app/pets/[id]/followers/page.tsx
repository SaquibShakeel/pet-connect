"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Follower = {
  id: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

export default function FollowersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [petName, setPetName] = useState("");

  useEffect(() => {
    fetchFollowers();
    fetchPet();
  }, [id]);

  async function fetchFollowers() {
    try {
      setLoading(true);
      const res = await fetch(`/api/pets/${id}/followers`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      const data = await res.json();
      setFollowers(data.followers);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch followers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPet() {
    try {
      const res = await fetch(`/api/pets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch pet");
      const data = await res.json();
      setPetName(data.pet.name);
    } catch (err) {
      console.error("Error fetching pet:", err);
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">
          {petName}'s Followers
        </h1>
        <p className="text-gray-600">
          {followers.length} {followers.length === 1 ? "person" : "people"} following this pet
        </p>
      </div>

      <div className="grid gap-4">
        {followers.map((follower) => (
          <Card key={follower.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  {follower.user.image ? (
                    <AvatarImage
                      src={follower.user.image}
                      alt={follower.user.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {follower.user.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold">{follower.user.name}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 