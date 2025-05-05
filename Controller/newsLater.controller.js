const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.SUPABASE_URL || "https://peflgfeieqtklcpkhszz.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZmxnZmVpZXF0a2xjcGtoc3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDEzNzksImV4cCI6MjA0Njc3NzM3OX0.OlEbttWuDvHHy9svUAr2quK4IrmRgkGUI0i8Z9LHfrU";
const supabase = createClient(supabaseUrl, supabaseKey);

// Newsletter subscription functions remain the same
const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if email already exists
    const { data: existing, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already subscribed" });
    }

    // Insert new email
    const { data, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }]);

    if (insertError) {
      console.error("Insert Error:", insertError);
      return res.status(500).json({ error: "Failed to subscribe" });
    }

    return res.status(200).json({ message: "Successfully subscribed", data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*");

    if (error) {
      console.error("Fetch Error:", error);
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }

    return res.status(200).json({ subscribers: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Add the "Tell Us About You" functions
const submitUserInfo = async (req, res) => {
  const { name, interest, favorite } = req.body;

  if (!name || !interest || !favorite) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Insert new user info
    const { data, error } = await supabase
      .from("user_info")
      .insert([{ name, interest, favorite }]);

    if (error) {
      console.error("Insert Error:", error);
      return res.status(500).json({ error: "Failed to submit information" });
    }

    return res.status(200).json({
      message: "Information submitted successfully",
      data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllUserInfo = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_info")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch user information" });
    }

    return res.status(200).json({ userInfo: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  subscribeToNewsletter,
  getAllSubscribers,
  submitUserInfo,
  getAllUserInfo,
};
