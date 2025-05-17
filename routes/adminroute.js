import express from 'express';
import { adminregister, VerifyOtp, ResendOtp, Login } from '../controllers/admincontroller.js';
import { addcategory, getcategories, statusupdate, editcategory, deletecategory } from "../controllers/categorycontroller.js";
import { getproduct, addproduct, updateproduct,deleteproduct} from "../controllers/productcontroller.js";
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();
console.log("the dooos");
console.log("Loading environment variables...");

// Log S3 configuration for debugging
console.log("AWS Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not set");
console.log("AWS Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not set");

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  



console.log("the dooos");

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: 'ogerasproduct',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 5 
    }
});

const router = express.Router();

// Admin Routes
router.post('/register', adminregister);
router.post('/verify-otp', VerifyOtp);
router.post('/resend-otp', ResendOtp);
router.post('/login', Login);

// Category Routes
router.post('/addcategory', addcategory);
router.get("/getcategory", getcategories);
router.patch("/updatestatus/:id", statusupdate);
router.patch("/editcategory/:id", editcategory);
router.delete("/deletecategory/:id", deletecategory);

// Product Routes
router.get("/getproducts", getproduct);
router.post('/addproduct',upload.array("images", 4), addproduct); 
router.patch('/updateproduct/:id',upload.array("images", 4), updateproduct)
router.delete("/deleteproduct/:id",deleteproduct)

export default router;
