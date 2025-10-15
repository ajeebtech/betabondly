"use client"

import { useParams } from "next/navigation"
import { CalendarIcon, Plus, MoreVertical, Heart, MessageCircle, Share2, Bookmark, Flag } from "lucide-react"
import { CameraIcon } from '@/components/icons/CameraIcon';
import { CalendarDrawer } from "@/components/CalendarDrawer"
import { DateDetailsDrawer } from "@/components/DateDetailsDrawer"
import EnhancedSidebar from "@/components/EnhancedSidebar"
import NotificationsPopover from "@/components/NotificationsPopover"
import { PostsLayout } from "@/components/PostsLayout"
import { EnhancedPostComposer } from "@/components/EnhancedPostComposer"
import { Button } from "@/components/ui/button"
import { CardStack, Highlight } from "@/components/ui/card-stack"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComposeMessageDialog } from "@/components/ComposeMessageDialog"
import { AddToCalendarDialog } from "@/components/AddToCalendarDialog"
import { TamaguiProvider } from "@/components/TamaguiProvider"
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getPostsByCouple, createPost } from '@/lib/services/postsService';
import { Post } from '@/types/db';
import { ensureValidToken } from '@/lib/authUtils';

type DatePlan = {
  date: Date
  startingPoint: string
  destination: string
  waypoints: string[]
  budget: string
  distance: string
}

const CARDS = [
  {
    id: 0,
    name: "Date Night",
    designation: "Today, 8:00 PM",
    content: (
      <p>
        Let's have a romantic evening together! <span className="font-bold text-pink-500">Dinner and a movie</span> - just the two of us. ❤️
      </p>
    ),
  },
];

export default function CoupleDashboard() {
  const params = useParams()
  const coupleId = (params.coupleId as string) || "TEST_COUPLE_001"
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isDateDetailsOpen, setIsDateDetailsOpen] = useState(false)
  const [cards, setCards] = useState(CARDS)
  const [budget, setBudget] = useState("")
  const [distance, setDistance] = useState("5")
  const [date, setDate] = useState<Date | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  // Function to add a new card to the cards state
  const addCard = (newCard: { name: string; designation: string; content: React.ReactNode }) => {
    const card = {
      id: Date.now(), // Use timestamp as unique ID
      name: newCard.name,
      designation: newCard.designation,
      content: newCard.content as React.ReactElement
    };
    setCards(prevCards => [card, ...prevCards]);
  }

  useEffect(() => {
    async function checkMembership() {
      if (!user) {
        setChecking(false);
        return;
      }
      
      try {
        // First, ensure we have a valid token
        const hasValidToken = await ensureValidToken();
        if (!hasValidToken) {
          console.log('❌ Invalid token - Access Denied');
          setAccessDenied(true);
          setChecking(false);
          return;
        }

        const coupleRef = doc(db, 'couples', coupleId);
        const coupleSnap = await getDoc(coupleRef);
        
        if (!coupleSnap.exists()) {
          console.log('Couple document does not exist:', coupleId);
          setAccessDenied(true);
          setChecking(false);
          return;
        }
        
        const coupleData = coupleSnap.data();
        console.log('Couple data:', coupleData);
        console.log('User UID:', user.uid);
        console.log('Members array:', coupleData.members);
        
        if (!coupleData.members || !coupleData.members.includes(user.uid)) {
          console.log('User not in members array - Access Denied');
          setAccessDenied(true);
        } else {
          console.log('User is member - Access Granted');
          setAccessDenied(false);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setAccessDenied(true);
      } finally {
        setChecking(false);
      }
    }
    
    if (!loading) {
      checkMembership();
    }
  }, [user, loading, coupleId]);

  // Load posts from Firestore
  useEffect(() => {
    async function loadPosts() {
      if (!coupleId) return;
      
      try {
        setLoadingPosts(true);
        const couplePosts = await getPostsByCouple(coupleId);
        setPosts(couplePosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    }
    
    loadPosts();
  }, [coupleId]);

  if (loading || checking) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Sign in to access this couple's dashboard</h2>
        <p className="text-sm text-gray-600 mb-4">Couple ID: {coupleId}</p>
        <Button onClick={() => window.location.href = '/sign-in'}>Sign In</Button>
      </div>
    );
  }
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p className="mb-4">You do not have permission to view this couple's dashboard.</p>
        <Button onClick={() => window.location.href = '/'}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Enhanced Sidebar */}
      <aside className="shrink-0 relative z-40">
        <EnhancedSidebar />
      </aside>

      <div className="flex-1 flex flex-col relative ml-[64px]">
        {/* Top Navigation Bar */}
        <header className="w-full bg-white/80 backdrop-blur-sm border-b border-rose-100 px-6 py-4 flex justify-end sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold">!</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8">
          {/* Left Column - Posts */}
          <div className="w-full lg:flex-1 max-w-[40rem] mx-auto">
            {/* Enhanced Post Composer */}
            <div className="w-full mb-8">
              <EnhancedPostComposer 
                placeholder="type whatever"
                onPost={async (postData) => {
                  if (!user || !coupleId) return;
                  
                  try {
                    // Handle media upload if present
                    let mediaUrl = undefined;
                    let mediaType = undefined;
                    
                    if (postData.media && postData.media.length > 0) {
                      const firstMedia = postData.media[0];
                      // Upload the first media file
                      const { uploadMediaFile } = await import('@/lib/services/mediaService');
                      const { url } = await uploadMediaFile(firstMedia.file, user.uid, coupleId);
                      mediaUrl = url;
                      mediaType = firstMedia.type;
                    }
                    
                    const newPost = await createPost({
                      userId: user.uid,
                      coupleId: coupleId,
                      content: postData.content,
                      mediaUrl: mediaUrl,
                      mediaType: mediaType,
                      likes: 0,
                      comments: 0
                    });
                    
                    // Refresh posts
                    const updatedPosts = await getPostsByCouple(coupleId);
                    setPosts(updatedPosts);
                  } catch (error) {
                    console.error('Error creating post:', error);
                  }
                }}
              />
            </div>
            
            {/* Scrollable Posts Container */}
            <div className="w-full h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {loadingPosts ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-6 border border-rose-100 hover:shadow-xl transition-all duration-300">
                    {/* Post Header */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 font-semibold shadow-sm">
                            {user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user?.displayName || 'User'}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()} · {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="text-gray-400 hover:text-gray-600 p-1 -mr-2 -mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuItem className="flex items-center space-x-2">
                              <Bookmark className="h-4 w-4" />
                              <span>Save post</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center space-x-2">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center space-x-2 text-red-500">
                              <Flag className="h-4 w-4" />
                              <span>Report</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                
                    {/* Post Content */}
                    <div className="p-4">
                      <p className="text-gray-800 text-lg leading-relaxed">
                        {post.content}
                      </p>
                      
                      {post.mediaUrl && (
                        <div className="mt-4">
                          {post.mediaType === 'image' ? (
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="w-full rounded-lg max-h-96 object-cover"
                            />
                          ) : (
                            <video 
                              src={post.mediaUrl} 
                              controls 
                              className="w-full rounded-lg max-h-96"
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Post Actions */}
                      <div className="flex items-center space-x-4 pt-4 pb-2 px-1">
                        <button className="group relative p-3 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-200 hover:scale-110 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:text-pink-600 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm text-pink-600 ml-2">{post.likes}</span>
                        </button>
                        <button className="group relative p-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:scale-110 shadow-sm">
                          <CameraIcon className="h-6 w-6 text-green-500 group-hover:text-green-600 transition-all" />
                          <span className="text-sm text-green-600 ml-2">{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Card Stack - Now positioned independently */}
        <div className="fixed right-8 top-4 w-72 hidden lg:flex flex-col">
          <div className="w-full flex justify-end pr-4 mb-2">
            <TamaguiProvider>
              <AddToCalendarDialog onCardAdded={addCard} />
            </TamaguiProvider>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 mt-4 hover:shadow-xl transition-all duration-300">
            <CardStack 
              items={cards} 
              className="w-full"
              onSwipe={(id) => {
                console.log(`Card ${id} swiped away`);
                // Remove the swiped card from the state
                setCards(prevCards => prevCards.filter(card => card.id !== id));
              }}
            />
          </div>
        </div>
        
        <Button 
          onClick={() => setIsDateDetailsOpen(true)}
          className="fixed bottom-8 right-8 rounded-full h-16 w-16 p-0 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-2 border-white"
        >
          <Plus className="h-7 w-7" />
        </Button>
        
        {/* Date Details Drawer */}
        <DateDetailsDrawer
          open={isDateDetailsOpen}
          onOpenChange={setIsDateDetailsOpen}
          selectedDate={date}
          onConfirm={() => {
            // Handle date confirmation
            setIsDateDetailsOpen(false);
          }}
          budget={budget}
          onBudgetChange={setBudget}
          distance={distance}
          onDistanceChange={setDistance}
        />
      </div>
    </div>
  )
}
