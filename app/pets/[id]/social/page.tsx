"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, ImagePlus, Users, Grid, Bookmark, Settings, X } from "lucide-react";
import NewPost from "./new-post";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Post = {
  id: string;
  image: string;
  caption: string | null;
  createdAt: string;
  likes: { id: string; userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
};

export default function SocialPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [pet, setPet] = useState<{ name: string; type: string; image?: string; description?: string; userId: string } | null>(null);
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    fetchPet();
    fetchPosts();
    fetchFollowers();
    async function checkFollowStatus() {
      if (!session?.user) return;
      
      try {
        const res = await fetch(`/api/pets/${id}/follow`);
        if (!res.ok) throw new Error("Failed to check follow status");
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    }

    checkFollowStatus();
  }, [id, session?.user]);

  async function fetchPet() {
    try {
      const res = await fetch(`/api/pets/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch pet");
      }
      const data = await res.json();
      setPet(data.pet);
    } catch (err) {
      console.error("Error fetching pet:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pet");
    }
  }

  async function fetchPosts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/pets/${id}/posts`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowers() {
    try {
      const res = await fetch(`/api/pets/${id}/followers`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      const data = await res.json();
      setFollowersCount(data.count);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  }

  async function handleLike(postId: string) {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      const isLiked = posts
        .find((p) => p.id === postId)
        ?.likes.some((l) => l.userId === session.user.id);

      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update like");
      }

      // Update posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const likes = isLiked
              ? post.likes.filter((l) => l.userId !== session.user.id)
              : [...post.likes, { id: "", userId: session.user.id }];
            return { ...post, likes };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Error updating like:", err);
      setError(err instanceof Error ? err.message : "Failed to update like");
    }
  }

  async function handleComment(postId: string) {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add comment");
      }

      const { comment } = await res.json();

      // Update posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [comment, ...post.comments],
            };
          }
          return post;
        })
      );

      setNewComment("");
      setSelectedPost(null);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err instanceof Error ? err.message : "Failed to add comment");
    }
  }

  async function handleFollow() {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setIsLoadingFollow(true);
    try {
      const res = await fetch(`/api/pets/${id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error updating follow status:", err);
      setError(err instanceof Error ? err.message : "Failed to update follow status");
    } finally {
      setIsLoadingFollow(false);
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

  const isPetOwner = session?.user?.id === pet?.userId;

  return (
    <div className="container mx-auto py-8">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              {pet?.image ? (
                <AvatarImage src={pet.image} alt={pet?.name} className="object-cover" />
              ) : (
                <AvatarFallback className="text-4xl bg-primary/10">
                  {pet?.name?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">{pet?.name}</h1>
              <div className="flex gap-2">
                {isPetOwner ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/pets/${id}`)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/pets/${id}/social/new-post`)}>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={isLoadingFollow}
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {isLoadingFollow ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isFollowing ? "Unfollowing..." : "Following..."}
                      </span>
                    ) : (
                      isFollowing ? "Unfollow" : "Follow"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{posts.length}</span>
                <span className="text-gray-600">posts</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/pets/${id}/followers`)}
                className="p-0 h-auto hover:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{followersCount}</span>
                  <span className="text-gray-600">followers</span>
                </div>
              </Button>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <p className="font-semibold">{pet?.type}</p>
              {pet?.description && (
                <p className="text-gray-600">{pet.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="border-t pt-8">
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square relative group cursor-pointer"
                onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
              >
                <img
                  src={post.image}
                  alt="Post"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="h-6 w-6" />
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <MessageCircle className="h-6 w-6" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedPost(null)}
        >
          <Card 
            className="w-full h-[90vh] sm:max-w-5xl p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-0 h-full">
              <div className="grid grid-rows-[1fr_auto] md:grid-cols-2 md:grid-rows-1 h-full">
                {/* Image Section */}
                <div className="relative bg-black h-[50vh] md:h-full">
                  <img
                    src={posts.find(p => p.id === selectedPost)?.image}
                    alt="Post"
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col h-[40vh] md:h-full overflow-y-auto">
                  {/* Pet Info and Caption Section */}
                  <div className="p-4 sm:p-8 border-b">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Pet Profile */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                          <AvatarImage
                            src={pet?.image || ""}
                            alt={pet?.name || ""}
                          />
                          <AvatarFallback>
                            {pet?.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold">{pet?.name}</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">{pet?.type}</p>
                        </div>
                      </div>

                      {/* Caption */}
                      {posts.find(p => p.id === selectedPost)?.caption && (
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(posts.find(p => p.id === selectedPost)?.createdAt || ""), "MMMM d, yyyy")}
                          </p>
                          <p className="text-sm sm:text-base leading-relaxed">
                            {posts.find(p => p.id === selectedPost)?.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="flex-1">
                    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                      {posts.find(p => p.id === selectedPost)?.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage
                              src={comment.user.image || ""}
                              alt={comment.user.name || ""}
                            />
                            <AvatarFallback>
                              {comment.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm sm:text-base font-semibold">
                                {comment.user.name}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {format(new Date(comment.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment Form Section */}
                  <div className="p-4 sm:p-8 border-t bg-muted/50">
                    {/* Like and Comment Count */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLike(selectedPost)}
                          className={`hover:bg-red-50 transition-colors ${
                            posts.find(p => p.id === selectedPost)?.likes.some(l => l.userId === session?.user?.id)
                              ? "text-red-500 hover:text-red-600"
                              : "hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                              posts.find(p => p.id === selectedPost)?.likes.some(l => l.userId === session?.user?.id)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </Button>
                        <span>{posts.find(p => p.id === selectedPost)?.likes.length || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{posts.find(p => p.id === selectedPost)?.comments.length || 0} comments</span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    {session?.user && (
                      <div className="flex gap-2 sm:gap-3">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 resize-none min-h-[60px] sm:min-h-[80px]"
                          rows={2}
                        />
                        <Button
                          onClick={() => handleComment(selectedPost)}
                          disabled={!newComment.trim()}
                          className="shrink-0 self-end"
                          size="sm"
                        >
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 