import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Mock user ID for now
    const userId = 1;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = parseInt(searchParams.get("offset")) || 0;
    const unreadOnly = searchParams.get("unread_only") === "true";

    // Mock notifications data
    const notifications = [
      {
        id: 1,
        user_id: userId,
        type: "market_alert",
        title: "New Market Opportunity",
        message:
          "Germany textile market shows 15% growth potential for your products",
        data: { country: "Germany", industry: "Textiles", growth: 15.2 },
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 2,
        user_id: userId,
        type: "buyer_match",
        title: "New Buyer Match",
        message:
          "Fashion retailer in UK shows interest in your cotton products",
        data: {
          buyer: "Fashion Plus Ltd",
          country: "UK",
          product: "Cotton T-shirts",
        },
        read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 3,
        user_id: userId,
        type: "campaign_update",
        title: "Campaign Performance Update",
        message:
          "Your email campaign achieved 24% open rate, above industry average",
        data: { campaign: "Q4 Outreach", open_rate: 24.5, industry_avg: 18.2 },
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 4,
        user_id: userId,
        type: "price_alert",
        title: "Price Optimization Suggestion",
        message:
          "Consider adjusting prices for EU markets based on competitor analysis",
        data: { market: "EU", suggested_change: -5.2, competitor_avg: 24.8 },
        read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 5,
        user_id: userId,
        type: "ai_insight",
        title: "AI Market Prediction",
        message:
          "AI forecasts 22% increase in demand for sustainable textiles in Q1 2025",
        data: {
          trend: "sustainable_textiles",
          predicted_growth: 22,
          period: "Q1 2025",
        },
        read: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    // Filter and paginate
    let filteredNotifications = notifications;
    if (unreadOnly) {
      filteredNotifications = notifications.filter((n) => !n.read);
    }

    const paginatedNotifications = filteredNotifications.slice(
      offset,
      offset + limit,
    );
    const unreadCount = notifications.filter((n) => !n.read).length;

    return Response.json({
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unread_count: unreadCount,
      has_more: offset + limit < filteredNotifications.length,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Mock user ID for now
    const userId = 1;

    const body = await request.json();
    const { notification_ids, mark_as_read } = body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return Response.json(
        { error: "notification_ids must be an array" },
        { status: 400 },
      );
    }

    // Mock update - in real app would update database
    console.log(
      `Marking notifications ${notification_ids.join(", ")} as ${mark_as_read ? "read" : "unread"} for user ${userId}`,
    );

    return Response.json({ success: true, updated: notification_ids.length });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Mock user ID for now
    const userId = 1;

    const body = await request.json();
    const { type, title, message, data } = body;

    if (!type || !title || !message) {
      return Response.json(
        { error: "type, title, and message are required" },
        { status: 400 },
      );
    }

    const notification = {
      id: Date.now(), // Mock ID
      user_id: userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      created_at: new Date(),
    };

    // Mock creation - in real app would insert to database
    console.log("Created notification:", notification);

    return Response.json({ notification });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
