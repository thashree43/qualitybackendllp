import express from 'express';
import { config } from 'dotenv';
config();
console.log("the dooos");
import {listcategories,newarrivals,categorycarosole,productpage,productdetails,emailsubmit} from "../controllers/clientcontroller.js" 


const router = express.Router();

router.get("/listcategories",listcategories)
router.get("/newarrivals",newarrivals)
router.get("/categorycarosole",categorycarosole)
router.get("/getproducts",productpage)
router.get('/productdetail/:id', productdetails);
router.post("/emailsubmit",emailsubmit)

export default router;