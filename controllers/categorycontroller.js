import CategoryModel from "../models/categoryModal.js";
import AdminModel from "../models/adminModel.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

export const addcategory = async (req, res) => {
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

        const { name, description, status } = req.body;

        if (!name || !description || status === undefined) {
            return res.status(400).json({ message: "Please provide all required data" });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. It should be "active" or "inactive".' });
        }

        const existcategory = await CategoryModel.findOne({ name });
        if (existcategory) {
            return res.status(409).json({ message: "Category already exists" });
        }
        
        const categorydatas = new CategoryModel({ name, description, status });
        await categorydatas.save();

        const admindata = await AdminModel.findById(adminId);
        if (!admindata) {
            return res.status(404).json({ message: "Admin not found" });
        }

        admindata.category.push(categorydatas._id);
        await admindata.save();



        await categorydatas.save();

        return res.status(201).json({ message: "Category added successfully" });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Error during adding category" });
    }
};

export const getcategories = async (req, res) => {
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
        if (!adminId) {
            return res.status(400).json({ message: "Invalid token payload: Admin ID is missing" });
        }


        const adminData = await AdminModel.findById(adminId).populate("category");

        if (!adminData) {
            return res.status(404).json({ message: "Admin not found" });
        }


        res.status(200).json({
            message: "Fetched categories successfully",
            categories: adminData.category,
        });

    } catch (error) {
        console.error("Error while fetching categories:", error);
        return res.status(500).json({ message: "Error while listing categories" });
    }
};

export const statusupdate = async (req, res) => {
    try {
        const id = req.params.id
        const status = req.body
        console.log("the cat id", id);
        console.log("the stat", status);


        if (!id) {
            return res.status(401).json({ message: "id is missing" })
        }
        const updatestatus = await CategoryModel.findByIdAndUpdate(id, { status: status.status }, { new: true });

        if (!updatestatus) {
            return res.status(404).json({ message: "The status has not been changed" });
        }

        res.status(200).json(updatestatus); // Return the updated category

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while changing  status" });
    }
}

export const editcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;


        const updateData = { name, description, status };

        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while editing category" });
    }
};

export const deletecategory = async (req, res) => {
    try {
        const catid = req.params.id; 
        console.log("id while deleting", catid);

        if (!catid || catid.length !== 24) { 
            return res.status(400).json({ message: "Invalid category ID" });
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
        console.log("adminid", adminId);

        const delcat = await CategoryModel.findByIdAndDelete(catid);
        if (!delcat) {
            return res.status(404).json({ message: "Category not found" });
        }

        const rem = await AdminModel.findByIdAndUpdate(adminId, { $pull: { category: catid } }, { new: true });
        console.log("removed from admin", rem);
        
        res.status(200).json({ success: true, message: 'Category deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while deleting category" });
    }
};
