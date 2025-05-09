const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with your project's URL and anon/public key
const supabaseUrl = "https://peflgfeieqtklcpkhszz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZmxnZmVpZXF0a2xjcGtoc3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDEzNzksImV4cCI6MjA0Njc3NzM3OX0.OlEbttWuDvHHy9svUAr2quK4IrmRgkGUI0i8Z9LHfrU";
const supabase = createClient(supabaseUrl, supabaseKey);

const PRINTFUL_API_KEY = "VLUOC2erat9bErXekeiQ3V2fmQ82vz6Vt3Htjv5o";
const PRINTFUL_STORE_ID = "14805728";
const PRINTFUL_BASE_URL = "https://api.printful.com";

// Create axios instance with default headers
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "");
};

// Create axios instance with default headers
const printfulClient = axios.create({
  baseURL: PRINTFUL_BASE_URL,
  headers: {
    Authorization: `Bearer ${PRINTFUL_API_KEY}`,
  },
});

// Add a response interceptor for rate limiting
printfulClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 429) {
      const retryAfter =
        parseInt(error.response.headers["retry-after"] || "10") * 1000;
      console.log(
        `Rate limited. Retrying after ${retryAfter / 1000} seconds...`
      );

      // Wait for the retry-after period
      await new Promise((resolve) => setTimeout(resolve, retryAfter));

      // Retry the request
      return printfulClient(error.config);
    }
    return Promise.reject(error);
  }
);

// Check if image is accessible
const validateImage = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    console.error("Image validation failed:", error.message);
    return false;
  }
};

const productConfigs = [
  {
    product_id: 223,
    name: "Premium T-Shirt",
    retail_price: 24.99,
    variants: {
      8024: { size: "S", price: 14.5 },
      8025: { size: "M", price: 14.5 },
      8026: { size: "L", price: 14.5 },
      8027: { size: "XL", price: 14.5 },
      8028: { size: "2XL", price: 16.0 },
    },
    body: {
      variant_ids: [8024, 8025, 8026, 8027, 8028],
      printfile_id: 1,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "front",
          position: {
            area_width: 1800,
            area_height: 2400,
            width: 1200,
            height: 1600,
            top: 0,
            left: 300,
          },
        },
      ],
    },
  },
  {
    product_id: 206,
    name: "Embroidered Hat",
    retail_price: 19.99,
    variants: {
      7853: { size: "One Size", price: 12.95 },
    },
    body: {
      variant_ids: [7853],
      printfile_id: 75,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "embroidery_front",
          position: {
            area_width: 1650,
            area_height: 600,
            width: 825,
            height: 600,
            top: 0,
            left: 412,
          },
        },
      ],
    },
  },
  {
    product_id: 565,
    name: "Product 565",
    retail_price: 24.25,
    variants: {
      14453: { size: "One size", color: "Black", price: 24.25 },
      14454: { size: "One size", color: "Navy", price: 24.25 },
      14455: { size: "One size", color: "Red", price: 24.25 },
      14456: { size: "One size", color: "Rope", price: 24.25 },
    },
    body: {
      variant_ids: [14453, 14454, 14455, 14456],
      printfile_id: 235,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "front",
          position: {
            area_width: 1800,
            area_height: 1800,
            width: 1800,
            height: 1800,
            top: 0,
            left: 0,
          },
        },
      ],
    },
  },
  {
    product_id: 682,
    name: "Product 682",
    retail_price: 12.95,
    variants: {
      16952: { size: "5.5″×8.5″", color: "Black", price: 12.95 },
      16953: { size: "5.5″×8.5″", color: "Blue", price: 12.95 },
      16954: { size: "5.5″×8.5″", color: "Lime", price: 12.95 },
      16955: { size: "5.5″×8.5″", color: "Navy", price: 12.95 },
    },
    body: {
      variant_ids: [16952, 16953, 16954],
      printfile_id: 444,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "front",
          position: {
            area_width: 900,
            area_height: 1500,
            width: 900,
            height: 1500,
            top: 0,
            left: 0,
          },
        },
      ],
    },
  },
  {
    product_id: 660,
    name: "Set of Pin Buttons",
    retail_price: 33,
    variants: {
      16411: {
        name: "Set of Pin Buttons (White / 1.25″)",
        size: "1.25″",
        color: "White",
        price: 8.25,
      },
      16412: {
        name: "Set of Pin Buttons (White / 2.25″)",
        size: "2.25″",
        color: "White",
        price: 9.25,
      },
    },
    body: {
      variant_ids: [16411, 16412],
      printfile_id: 418,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "front",
          position: {
            area_width: 787,
            area_height: 787,
            width: 787,
            height: 787,
            top: 0,
            left: 0,
          },
        },
      ],
    },
  },

  {
    product_id: 788,
    name: "Stainless Steel Water Bottle with a Straw Lid",
    retail_price: 33, // Adjust if needed based on your pricing rules
    variants: {
      20175: {
        name: "Stainless Steel Water Bottle with a Straw Lid (White / 32 oz)",
        size: "32 oz",
        color: "White",
        price: 20.75,
      },
    },
    body: {
      variant_ids: [20175],
      printfile_id: 679,
      format: "jpg",
      width: 0,
      product_options: {},
      files: [
        {
          placement: "default",
          position: {
            area_width: 3402,
            area_height: 2091,
            width: 3402,
            height: 2091,
            top: 0,
            left: 0,
          },
        },
      ],
    },
  },
];

const getSyncedProducts = async (req, res) => {
  try {
    // Fetch all catalog products (not store products)
    const response = await printfulClient.get("/products");

    // Map the response to a more usable format with product IDs and variant details
    const catalogProducts = response.data.result.map((product) => {
      return {
        product_id: product.id,
        type: product.type,
        title: product.title,
        model: product.model,
        image: product.image,
        variant_count: product.variant_count,
      };
    });

    // Return product catalog data
    return res.status(200).json({
      success: true,
      product_count: catalogProducts.length,
      products: catalogProducts,
    });
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch Printful catalog",
    });
  }
};

// Get detailed information about a specific product including variants

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    // Get the store ID from environment variables
    const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || "14805728";

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    // First, get the general catalog product information
    let catalogProductResponse;
    try {
      // This endpoint gets catalog product info without requiring store_id
      catalogProductResponse = await printfulClient.get(
        `/products/${productId}`
      );
    } catch (catalogError) {
      console.error("Error fetching catalog product:", catalogError);
      // Continue even if this fails, as we might still get variant info from other endpoints
    }

    // Fetch printfile information to get valid placements
    // This endpoint may need store_id based on error
    const printfileResponse = await printfulClient.get(
      `/mockup-generator/printfiles/${productId}?store_id=${PRINTFUL_STORE_ID}`
    );
    const printfileData = printfileResponse.data.result;

    // Now try to get variant info from sync variants endpoint
    let variantInfo = {};
    let variantIds = [];

    try {
      // Explicitly include store_id in the request URL
      const syncVariantsResponse = await printfulClient.get(
        `/store/products?store_id=${PRINTFUL_STORE_ID}`
      );

      // Find the product in your store products
      const storeProduct = syncVariantsResponse.data.result.find(
        (product) => product.sync_product.external_id === productId.toString()
      );

      if (storeProduct) {
        storeProduct.sync_variants.forEach((variant) => {
          const variantId = variant.variant_id;
          variantIds.push(variantId);
          variantInfo[variantId] = {
            name: variant.name,
            size: variant.size || "Default",
            color: variant.color || "Default",
            price: variant.retail_price,
          };
        });
      }
    } catch (variantError) {
      console.error("Error fetching variant info:", variantError);
      // If we can't get variant info from store, use catalog info if available
      if (
        catalogProductResponse &&
        catalogProductResponse.data.result.variants
      ) {
        catalogProductResponse.data.result.variants.forEach((variant) => {
          variantIds.push(variant.id);
          variantInfo[variant.id] = {
            name: variant.name,
            size: variant.size || "Default",
            color: variant.color || "Default",
            price: variant.price,
          };
        });
      }
    }

    // If we still don't have variant info, use some default variants from printfile data
    if (Object.keys(variantInfo).length === 0) {
      // Create dummy variant ids
      const dummyVariantId = 9000 + parseInt(productId);
      variantIds = [dummyVariantId];
      variantInfo[dummyVariantId] = {
        name: "Default",
        size: "Default",
        color: "Default",
        price: 14.99, // Default price
      };
    }

    // Determine product name
    const productName =
      catalogProductResponse?.data?.result?.title || `Product ${productId}`;

    // Build product configuration template
    const productConfig = {
      product_id: parseInt(productId),
      name: productName,
      retail_price: (
        parseFloat(Object.values(variantInfo)[0].price) * 1.5
      ).toFixed(2), // Example markup
      variants: variantInfo,
      body: {
        variant_ids: variantIds.map((id) => parseInt(id)),
        printfile_id:
          printfileData.printfiles && printfileData.printfiles[0]
            ? printfileData.printfiles[0].id
            : 1,
        format: "jpg",
        width: 0,
        product_options: {},
        files: [
          {
            placement:
              printfileData.placements &&
              Object.keys(printfileData.placements).length > 0
                ? Object.keys(printfileData.placements)[0]
                : "default",
            position: {
              area_width: 1800,
              area_height: 2400,
              width: 1800,
              height: 2400,
              top: 0,
              left: 0,
            },
          },
        ],
      },
    };

    return res.status(200).json({
      success: true,
      product_data: {
        product_id: parseInt(productId),
        name: productName,
        variants: variantInfo,
        variant_ids: variantIds.map((id) => parseInt(id)),
        printfiles: printfileData.printfiles || [],
        placements: printfileData.placements || {},
        store_id: PRINTFUL_STORE_ID, // Include store_id in the response
      },
      // Include a ready-to-use configuration
      product_config: productConfig,
    });
  } catch (error) {
    console.error(
      `Error fetching details for product ${req.params.productId}:`,
      error
    );

    // More detailed error information
    const errorDetails = error.response
      ? {
          status: error.response.status,
          data: error.response.data,
        }
      : null;

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch product details",
      details: errorDetails,
    });
  }
};

// Search for products by name
const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.term?.toLowerCase();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    // Fetch all catalog products
    const response = await printfulClient.get("/products");

    // Filter products by search term
    const matchingProducts = response.data.result.filter((product) =>
      product.title.toLowerCase().includes(searchTerm)
    );

    return res.status(200).json({
      success: true,
      product_count: matchingProducts.length,
      products: matchingProducts.map((product) => ({
        product_id: product.id,
        title: product.title,
        type: product.type,
        model: product.model,
        image: product.image,
        variant_count: product.variant_count,
      })),
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to search products",
    });
  }
};

// 2. Generate Mockups API - Optimized with pricing
const generateMockups = async (req, res) => {
  try {
    const { file_name, contents } = req.body;

    if (!contents || !file_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
      });
    }

    // Clean the filename before uploading
    const sanitizedFileName = sanitizeFileName(file_name);
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

    // Upload to Supabase
    const imageBlob = Buffer.from(contents.split(";base64,")[1], "base64");

    const { data, error } = await supabase.storage
      .from("Images")
      .upload(uniqueFileName, imageBlob, {
        upsert: true,
        contentType: "image/png",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({
        success: false,
        error: "Image upload failed",
        details: error,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("Images")
      .getPublicUrl(data.path);

    const imageUrl = urlData.publicUrl;

    // Validate image is accessible
    const isImageValid = await validateImage(imageUrl);
    if (!isImageValid) {
      return res.status(400).json({
        success: false,
        error: "The uploaded image is not accessible or cannot be validated",
      });
    }

    // Upload to Printful with retry mechanism
    let printfulFileId;
    try {
      const printfulResponse = await printfulClient.post(
        `/files?store_id=${PRINTFUL_STORE_ID}`,
        { url: imageUrl }
      );
      printfulFileId = printfulResponse.data.result.id;
    } catch (error) {
      console.error(
        "Printful file upload error:",
        error.response?.data || error
      );
      return res.status(500).json({
        success: false,
        error: "Failed to upload file to Printful",
        details: error.response?.data || error.message,
      });
    }

    // Batch process for mockup generation with rate limit handling
    const mockupPromises = productConfigs.map(async (config) => {
      try {
        // Add image URL to files configuration
        const mockupConfig = {
          ...config.body,
          files: config.body.files.map((file) => ({
            ...file,
            image_url: imageUrl,
          })),
        };

        // Add a small delay between each request to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));

        const response = await printfulClient.post(
          `/mockup-generator/create-task/${config.product_id}?store_id=${PRINTFUL_STORE_ID}`,
          mockupConfig
        );

        return {
          product_id: config.product_id,
          product_name: config.name,
          pricing: {
            retail_price: config.retail_price,
            variants: config.variants,
          },
          success: true,
          mockupTaskKey: response.data.result.task_key,
          placement: mockupConfig.files[0].placement,
          message: `Mockup generated successfully for product ID: ${config.product_id}`,
        };
      } catch (error) {
        console.error(
          `Error generating mockup for product ${config.product_id}:`,
          error.response?.data || error
        );
        return {
          product_id: config.product_id,
          product_name: config.name,
          success: false,
          error: error.response?.data?.error || error.message,
          message: `Failed to generate mockup for product ID: ${config.product_id}`,
        };
      }
    });

    const mockupResults = await Promise.allSettled(mockupPromises);

    const successfulMockups = mockupResults
      .filter((result) => result.status === "fulfilled" && result.value.success)
      .map((result) => result.value);

    const failedMockups = mockupResults
      .filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.success)
      )
      .map((result) =>
        result.status === "rejected" ? { error: result.reason } : result.value
      );

    return res.status(200).json({
      success: true,
      image_url: imageUrl,
      printful_file_id: printfulFileId,
      results: {
        successful_mockups: successfulMockups,
        failed_mockups: failedMockups,
        total_products: mockupResults.length,
        successful_count: successfulMockups.length,
        failed_count: failedMockups.length,
      },
    });
  } catch (error) {
    console.error("Main process error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to complete mockup generation process",
      details: error.message,
    });
  }
};

// 3. Get Shipping Rates API - Optimized
const getShippingRates = async (req, res) => {
  try {
    const { recipient, items } = req.body;

    if (!recipient || !items) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        details: {
          recipient: !recipient ? "Missing recipient information" : undefined,
          items: !items ? "Missing items" : undefined,
          store_id: PRINTFUL_STORE_ID,
        },
      });
    }

    const response = await printfulClient.post(
      `/shipping/rates?store_id=${PRINTFUL_STORE_ID}`,
      { recipient, items }
    );

    return res.status(200).json({
      success: true,
      rates: response.data.result,
    });
  } catch (error) {
    console.error("Shipping rates error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get shipping rates",
      details: error.response?.data || error.message,
    });
  }
};

// 4. Place Order API - Optimized
const placeOrder = async (req, res) => {
  try {
    const { recipient, items, shipping_option_id } = req.body;

    if (!recipient || !items || !shipping_option_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        details: {
          recipient: !recipient ? "Missing recipient information" : undefined,
          items: !items ? "Missing items" : undefined,
          shipping_option_id: !shipping_option_id
            ? "Missing shipping option"
            : undefined,
        },
      });
    }

    const response = await printfulClient.post(
      `/orders?store_id=${PRINTFUL_STORE_ID}`,
      {
        recipient,
        items,
        shipping: shipping_option_id,
      }
    );

    return res.status(200).json({
      success: true,
      order: response.data.result,
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to place order",
      details: error.response?.data || error.message,
    });
  }
};

// Optimized mockup results fetching
const getMockupResults = async (req, res) => {
  try {
    // Get payload from query params and parse it
    const payload = JSON.parse(req.query.payload || "[]");
    console.log("Received payload:", payload);

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid payload. Expected an array of successful mockups.",
      });
    }

    const mockupResults = await Promise.all(
      payload.map(async (mockup) => {
        try {
          if (!mockup || !mockup.mockupTaskKey) {
            console.error("Invalid mockup data:", mockup);
            return {
              product_id: mockup?.product_id,
              product_name: mockup?.product_name,
              success: false,
              error: "Missing mockup task key",
            };
          }

          const mockupUrl = await getMockupUrl(mockup.mockupTaskKey);
          return {
            product_id: mockup.product_id,
            product_name: mockup.product_name,
            pricing: mockup.pricing,
            mockupUrl,
            success: !!mockupUrl,
            placement: mockup.placement,
            message: mockupUrl
              ? `Mockup retrieved successfully for ${mockup.product_name}`
              : `Failed to retrieve mockup for ${mockup.product_name}`,
          };
        } catch (error) {
          console.error(
            `Error processing mockup ${mockup?.product_id}:`,
            error
          );
          return {
            product_id: mockup?.product_id,
            product_name: mockup?.product_name,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const successfulMockups = mockupResults.filter((m) => m.success);
    const failedMockups = mockupResults.filter((m) => !m.success);

    return res.status(200).json({
      success: true,
      mockups: {
        successful: successfulMockups,
        failed: failedMockups,
        total: mockupResults.length,
        successful_count: successfulMockups.length,
        failed_count: failedMockups.length,
      },
    });
  } catch (error) {
    console.error("Error getting mockup results:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get mockup results",
      details: error.message,
    });
  }
};

// Optimized mockup URL fetching with exponential backoff
const getMockupUrl = async (taskKey) => {
  const maxAttempts = 10;
  let waitTime = 1000; // Start with 1 second
  const maxWaitTime = 8000; // Max 8 seconds between attempts

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await printfulClient.get(
        `/mockup-generator/task?task_key=${taskKey}&store_id=${PRINTFUL_STORE_ID}`
      );

      if (response.data.result.status === "completed") {
        return response.data.result.mockups[0].mockup_url;
      }

      if (response.data.result.status === "failed") {
        console.error("Mockup generation failed:", response.data.result);
        return null;
      }

      // Exponential backoff
      waitTime = Math.min(waitTime * 1.5, maxWaitTime);
      console.log(
        `Waiting ${waitTime / 1000}s before next attempt for task ${taskKey}`
      );

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (error) {
      console.error(
        `Error checking mockup status (attempt ${attempt + 1}):`,
        error.message
      );

      // Exponential backoff after error
      waitTime = Math.min(waitTime * 2, maxWaitTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  console.error(
    `Mockup generation timed out after ${maxAttempts} attempts for task: ${taskKey}`
  );
  return null;
};

module.exports = {
  getSyncedProducts,
  generateMockups,
  getShippingRates,
  placeOrder,
  getMockupResults,
  getProductDetails,
};
