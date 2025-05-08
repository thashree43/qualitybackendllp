import CategoryModel from "../models/categoryModal.js";
import AdminModel from "../models/adminModel.js"
import ProductModel from "../models/productModal.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import productModal from "../models/productModal.js";
dotenv.config()


export const getproduct = async (req, res) => {
    try {
        const token = req.cookies?.adminjwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is missing" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        } catch (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const adminId = decoded?.id;
        console.log("Admin ID:", adminId);

        const admin = await AdminModel.findById(adminId)
            .populate({
                path: "category",
                populate: { path: "product" }
            })
            .populate("product");

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const categoriesWithProducts = admin.category || [];
        const productsofadmin = admin.product || [];



        res.status(200).json({
            categories: categoriesWithProducts,
            products: productsofadmin,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching products" });
    }
};



export const addproduct = async (req, res) => {
    console.log("It might may have reached the addproduct controller");

    try {
        const { name, description, price, category, status } = req.body;
        console.log("The data for adding product:", req.body);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "File upload failed" });
        }

        const token = req.cookies?.adminjwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is missing" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        } catch (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const adminId = decoded?.id;
        const imageUrls = req.files.map(file => file.location);

        console.log("Product details:", req.body);
        console.log("Uploaded image URLs:", imageUrls);

        const existproduct = await ProductModel.findOne({ name });
        if (existproduct) {
            return res.status(409).json({ message: "Product already exists" });
        }

        const admindata = await AdminModel.findById(adminId);
        if (!admindata) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const proid = await CategoryModel.findById(category);
        if (!proid) {
            return res.status(404).json({ message: "Category not found" });
        }
        console.log("12122121212121212121212121212121221212121");

        const newProduct = new ProductModel({
            name,
            description,
            price,
            status,
            image: imageUrls,
            admindata: [adminId],
            category: proid._id
        });

        await newProduct.save();
        admindata.product.push(newProduct._id);
        proid.product.push(newProduct._id);
        await admindata.save();
        await proid.save();

        return res.status(201).json({ message: "Product added successfully", product: newProduct });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding product" });
    }
};

export const updateproduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, status } = req.body;
        console.log("Received update product data:", req.body);

        const existingProduct = await productModal.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updateData = { name, description, price, status };

        // Handle Category Update
        if (category && category !== existingProduct.category.toString()) {
            await CategoryModel.updateOne(
                { _id: existingProduct.category },
                { $pull: { product: id } }
            );

            const newCategory = await CategoryModel.findById(category);
            if (!newCategory) {
                return res.status(404).json({ success: false, message: 'New category not found' });
            }

            newCategory.product.push(id);
            await newCategory.save();
            updateData.category = category;
        }

        console.log("the images of the urls ",req.files);
        
        // Handle Image Update
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.location);
            updateData.image = newImageUrls;
            console.log("Updated image URLs:", updateData.image);
        } else {
            console.log("No new images uploaded.");
        }

        const updatedProduct = await productModal.findByIdAndUpdate(id, { $set: updateData }, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error in updateproduct:", error);
        res.status(500).json({
            success: false,
            message: "Error updating the product",
            error: error.message
        });
    }
};



export const deleteproduct = async(req, res) => {
    try {
        const productId = req.params.id;
        console.log("Product ID to delete:", productId);
        
        // Validate product ID
        if (!productId || productId.length !== 24) { 
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Verify admin token
        const token = req.cookies?.adminjwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is missing" });
        }

        // Decode token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        } catch (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const adminId = decoded?.id;
        console.log("Admin ID:", adminId);

        // Find the product first to get its category
        const product = await productModal.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get the category IDs from the product
        const categoryIds = product.category;
        console.log("Category IDs to update:", categoryIds);

        // Remove product from categories
        if (categoryIds && categoryIds.length > 0) {
            await CategoryModel.updateMany(
                { _id: { $in: categoryIds } },
                { $pull: { product: productId } }
            );
            console.log("Product removed from categories");
        }

        // Remove product from admin's products array
        const updatedAdmin = await AdminModel.findByIdAndUpdate(
            adminId,
            { $pull: { product: productId } },
            { new: true }
        );
        console.log("Product removed from admin");

        // Delete the product
        await productModal.findByIdAndDelete(productId);
        console.log("Product deleted successfully");

        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error("Error in deleteproduct:", error);
        return res.status(500).json({ 
            message: "Error while deleting product",
            error: error.message 
        });
    }
};
