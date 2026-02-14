import { NextResponse, type NextRequest } from "next/server";

interface MockMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

// ─── Mock Conversation Data ──────────────────────────────────

const MOCK_MESSAGES: MockMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-1",
    senderName: "Maya Chen",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    recipientId: "demo-user",
    content: "Thank you so much for supporting my ceramics dream! Your order is being handcrafted right now.",
    timestamp: "2026-02-12T10:30:00Z",
    status: "read",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "demo-user",
    senderName: "You",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    recipientId: "user-1",
    content: "That's exciting! I can't wait to receive it. The sunrise glaze looks absolutely stunning in the photos.",
    timestamp: "2026-02-12T11:15:00Z",
    status: "read",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-1",
    senderName: "Maya Chen",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    recipientId: "demo-user",
    content: "It looks even better in person, I promise! I'm firing a batch this weekend and yours will be among them. Would you like me to send progress photos?",
    timestamp: "2026-02-12T14:00:00Z",
    status: "read",
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "demo-user",
    senderName: "You",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    recipientId: "user-1",
    content: "Yes please! I'd love to see the process. It's one of the things that makes Dream Store special — feeling connected to the creator.",
    timestamp: "2026-02-12T14:30:00Z",
    status: "read",
  },
  {
    id: "msg-5",
    conversationId: "conv-1",
    senderId: "user-1",
    senderName: "Maya Chen",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    recipientId: "demo-user",
    content: "That means the world to me! I'll send you some photos from this weekend's kiln opening. Each piece comes out slightly different — that's the magic of handmade.",
    timestamp: "2026-02-13T09:00:00Z",
    status: "read",
  },
  {
    id: "msg-6",
    conversationId: "conv-2",
    senderId: "user-2",
    senderName: "Daniel Okafor",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    recipientId: "demo-user",
    content: "Hi! I saw you were looking at the FarmSight Starter Kit. Happy to answer any questions about how it works in the field.",
    timestamp: "2026-02-13T15:00:00Z",
    status: "read",
  },
  {
    id: "msg-7",
    conversationId: "conv-2",
    senderId: "demo-user",
    senderName: "You",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    recipientId: "user-2",
    content: "Hi Daniel! Yes, I'm really interested. Does it work in areas with limited internet connectivity?",
    timestamp: "2026-02-13T15:30:00Z",
    status: "delivered",
  },
  {
    id: "msg-8",
    conversationId: "conv-3",
    senderId: "user-3",
    senderName: "Sofia Martinez",
    senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    recipientId: "demo-user",
    content: "Your bread subscription is all set! First delivery goes out next Monday. Get ready for the best sourdough you've ever tasted!",
    timestamp: "2026-02-14T08:00:00Z",
    status: "delivered",
  },
];

// ─── GET: Retrieve messages for a conversation ───────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    const messages = MOCK_MESSAGES.filter(
      (m) => m.conversationId === conversationId
    );
    return NextResponse.json({ messages });
  }

  // Return all conversations overview
  const conversations = new Map<
    string,
    {
      conversationId: string;
      lastMessage: MockMessage;
      unreadCount: number;
      participant: {
        id: string;
        name: string;
        avatar: string;
      };
    }
  >();

  for (const msg of MOCK_MESSAGES) {
    const existing = conversations.get(msg.conversationId);
    if (
      !existing ||
      new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)
    ) {
      const isOwnMessage = msg.senderId === "demo-user";
      conversations.set(msg.conversationId, {
        conversationId: msg.conversationId,
        lastMessage: msg,
        unreadCount: msg.status !== "read" && !isOwnMessage ? 1 : 0,
        participant: isOwnMessage
          ? {
              id: msg.recipientId,
              name: MOCK_MESSAGES.find(
                (m) =>
                  m.conversationId === msg.conversationId &&
                  m.senderId === msg.recipientId
              )?.senderName || "Unknown",
              avatar: MOCK_MESSAGES.find(
                (m) =>
                  m.conversationId === msg.conversationId &&
                  m.senderId === msg.recipientId
              )?.senderAvatar || "",
            }
          : {
              id: msg.senderId,
              name: msg.senderName,
              avatar: msg.senderAvatar,
            },
      });
    }
  }

  return NextResponse.json({
    conversations: Array.from(conversations.values()),
    totalUnread: Array.from(conversations.values()).reduce(
      (sum, c) => sum + c.unreadCount,
      0
    ),
  });
}

// ─── POST: Send a new message ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      recipientId?: string;
      content?: string;
      conversationId?: string;
    };

    const { recipientId, content, conversationId } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json(
        { error: "recipientId and content are required" },
        { status: 400 }
      );
    }

    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || `conv-new-${Date.now()}`,
      senderId: "demo-user",
      senderName: "You",
      senderAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      recipientId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
