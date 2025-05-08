import CategoryModel from "../models/categoryModal.js";
import ProductModel from "../models/productModal.js"
import mongoose from "mongoose";
import {transporter} from "../services/gmailservice.js"

export const listcategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find().populate("product");

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Error while listing categories" });
  }
};

export const newarrivals = async (req, res) => {
  try {
    const categories = await CategoryModel.find()
      .populate({
        path: "product",
        match: { status: "new_arrival" },
        options: { sort: { createdAt: -1 } },
      });


    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return res.status(500).json({ message: "Error while listing new arrivals" });
  }
};

export const categorycarosole = async (req, res) => {
  try {

    const listcat = await CategoryModel.find()
    return res.status(200).json(listcat)
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Error while listing categories" });
  }
}

export const productpage = async (req, res) => {
  try {
    const catproducts = await CategoryModel.find().populate("product")
    return res.status(200).json(catproducts)

  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Error while listing products" });
  }
}

export const productdetails = async (req, res) => {
  try {
    const proid = req.params.id;
    console.log("the id for to display the pro",proid);
    
    const productdata = await ProductModel.findById(proid).populate('category');
    
    if (!productdata) {
      return res.status(404).json({ message: "Product not found" });
    }

    const categoryId = productdata.category[0];
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const catproducts = await ProductModel.find({ category: categoryId, _id: { $ne: proid } })
      .limit(limit)
      .skip(skip);

    return res.status(200).json({ productdata, catproducts });
  } catch (error) {
    console.error("Error while fetching product details:", error);
    return res.status(500).json({ message: "Error while fetching product details" });
  }
};


export const emailsubmit = async (req, res) => {
  try {
    const { name, mobileNumber, emailId, place, pincode, productId, productName } = req.body;
    console.log("Received data for email submission:", req.body);

    // Validate productId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const objectId = new mongoose.Types.ObjectId(productId);
    console.log("Validated ObjectId:", objectId);

    // Fetch product data using the validated ObjectId
    const product = await ProductModel.findById(objectId);
    console.log("Fetched product details:", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Construct email content with user and product details
    const mailOptions = {
      from: emailId, // Use the email provided in the form
      to: "thashreefkhangeo@gmail.com", // Fixed recipient email
      subject: `New Product Inquiry: ${productName}`,
      html: `
        <html>
          <body>
            <h2>New Product Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
            <p><strong>Email ID:</strong> ${emailId}</p>
            <p><strong>Place:</strong> ${place}</p>
            <p><strong>Pincode:</strong> ${pincode}</p>
            <h3>Product Details:</h3>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Product Description:</strong> ${product.description}</p>
          </body>
        </html>
      `,
      replyTo: emailId, // Add reply-to header to make replies go back to the customer
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully with product details.");

    return res.status(200).json({ message: "Email sent successfully", success: true });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
