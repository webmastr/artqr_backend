const stripe = require("stripe")(
  "sk_test_51O8UWtKHNXl8PTAGxN4Gwt29m8jTT5gGWKM5bueaB51kYTO0c1r6oTFLuTj5rxuh58wSyGP4leDhqeQ7GSCvn28c00oHEk08BZ"
);

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.SUPABASE_URL || "https://peflgfeieqtklcpkhszz.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZmxnZmVpZXF0a2xjcGtoc3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDEzNzksImV4cCI6MjA0Njc3NzM3OX0.OlEbttWuDvHHy9svUAr2quK4IrmRgkGUI0i8Z9LHfrU";
const supabase = createClient(supabaseUrl, supabaseKey);
const express = require("express");

const stripeCheckoutController = async (req, res) => {
  try {
    const { customer, items, shipping } = req.body;
    // Safe coupon handling - avoid destructuring which may cause issues if undefined
    const coupon =
      req.body.coupon && typeof req.body.coupon === "object"
        ? req.body.coupon
        : null;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        error: "No items provided",
      });
    }

    // Calculate total price from all items
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * (item.quantity || 1);
    });

    // Apply coupon discount if available - use safer checks to avoid errors
    let discount = 0;
    let couponCode = null;
    if (coupon && coupon.valid === true) {
      couponCode = coupon.code || "DISCOUNT";
      if (coupon.type === "percentage" && typeof coupon.value === "number") {
        const maxDiscount =
          typeof coupon.maxDiscount === "number"
            ? coupon.maxDiscount
            : Infinity;
        discount = Math.min((subtotal * coupon.value) / 100, maxDiscount);
      } else if (typeof coupon.value === "number") {
        discount = Math.min(coupon.value, subtotal);
      }
    }

    // Calculate final total after discount
    const finalTotal = Math.max(subtotal - discount, 0); // Ensure we don't go negative

    // Create line items for Stripe - simpler approach to avoid issues
    const lineItems = [];

    // Add each product
    items.forEach((item) => {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Product",
            // Avoid using images which might cause issues
            metadata: {
              designUrl: item.designUrl || "",
              designText: item.designText || "",
              size: item.size || "",
              variantId: item.variant_id || "",
            },
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convert to cents with fallback
        },
        quantity: item.quantity || 1,
      });
    });

    // Add discount line item if applicable - simplified approach
    if (discount > 0) {
      // Instead of a negative line item which can cause issues,
      // use a coupon directly in the Stripe session
      const couponId = `COUPON_${Date.now()}`;
      try {
        await stripe.coupons.create({
          id: couponId,
          amount_off: Math.round(discount * 100),
          currency: "usd",
          name: couponCode || "Discount",
        });
      } catch (err) {
        console.error("Error creating coupon:", err);
        // Continue without coupon if there's an error
      }
    }

    // Create checkout session with simplified options
    const sessionOptions = {
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customer.email || undefined,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0, // Free shipping
              currency: "usd",
            },
            display_name: shipping?.name || "Carbon Neutral Shipping (FREE)",
          },
        },
      ],
      // Remove shipping_address_collection to use address from form
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/stripe/success`,
      cancel_url: `${req.protocol}://${req.get("host")}/stripe/cancel`,
    };

    // Add coupon if we successfully created one
    if (discount > 0) {
      try {
        const couponId = `COUPON_${Date.now()}`;
        sessionOptions.discounts = [
          {
            coupon: couponId,
          },
        ];
      } catch (err) {
        console.log("Skipping coupon application");
      }
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Save payment details to Supabase (temporary - assumes success)
    const { error } = await supabase.from("payments").insert([
      {
        customer_email: customer.email || "unknown",
        product_names: items.map((item) => item.name).join(", "),
        original_price: subtotal,
        discount: discount,
        final_price: finalTotal,
        shipping_name: shipping.name || "Carbon Neutral Shipping",
        shipping_rate: 0, // Free shipping
        status: "pending",
        session_id: session.id,
        coupon_code: coupon?.code || null,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
    }

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.stack);
    return res.status(500).json({
      success: false,
      error: "Stripe checkout error",
      details: error.message,
    });
  }
};

const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret =
    process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret_here";

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const sessionId = session.id;
    const customerEmail = session.customer_email;

    // Update the Supabase record where session_id matches
    const { error } = await supabase
      .from("payments")
      .update({ status: "paid" })
      .eq("session_id", sessionId);

    if (error) {
      console.error(
        "Error updating payment status in Supabase:",
        error.message
      );
      return res.status(500).send("Supabase update failed");
    }

    console.log(`Payment completed for session: ${sessionId}`);
  }

  res.status(200).send("Received");
};

const successController = (req, res) =>
  res.redirect("https://artofqr-main.vercel.app/success");

const cancelController = (req, res) =>
  res.redirect("https://artofqr-main.vercel.app/failure");

module.exports = {
  stripeCheckoutController,
  successController,
  cancelController,
};
