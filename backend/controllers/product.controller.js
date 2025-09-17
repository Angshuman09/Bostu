import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import { Product } from "../models/product.model.js";

export const getAllProductController = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    console.log(`error in getAllProductController: ${error}`);
    res
      .status(500)
      .json({ error: `error in getAllProductController: ${error}` });
  }
};

export const getFeaturedProductController = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_Products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isfeatured: true }).lean();

    if (!featuredProducts)
      return res.status(404).json({ error: "Product not found." });

    await redis.set("featured_Products", JSON.stringify(featuredProducts));

    return res.json(featuredProducts);
  } catch (error) {
    console.log(`error in getFeaturedProductController: ${error}`);
    res
      .status(500)
      .json({ error: `error in getFeaturedProductController: ${error}` });
  }
};

export const createProductController = async (req, res) => {
  try {
    const {name, description, price, image, category} = req.body;
    
    let cloudinaryResponse = null;

    if(image){
        cloudinaryResponse = await cloudinary.uploader.upload(image,{
            folder: 'products'
        })
    }

    const product = await Product.create({
        name,
        description,
        price,
        image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
        category
    })

    res.status(201).json(product);
    
  } catch (error) {
    console.log(`error in createProductController: ${error}`);
    res
      .status(500)
      .json({ error: `error in createProductController: ${error}` });
  }
};
