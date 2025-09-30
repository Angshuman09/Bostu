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
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: {
        secure_url: cloudinaryResponse?.secure_url || "",
        public_id: cloudinaryResponse.public_id,
      },
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log(`error in createProductController: ${error}`);
    res
      .status(500)
      .json({ error: `error in createProductController: ${error}` });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product?.image && product.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(product.image.public_id);
        console.log("image deleted successfully");
      } catch (error) {
        console.log(`error in deleteing the image in cloudinary: ${error}`);
      }
    }

    await Product.findByIdAndDelete(product._id);
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    console.log(`error in deleteProductController: ${error}`);
    res
      .status(500)
      .json({ error: `error in deleteProductController: ${error}` });
  }
};

export const getRecommendProductController = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          description: 1,
        },
      },
    ]);

    res.status(200).json({ products });
  } catch (error) {
    console.log(`error in getRecommendProductController controller: ${error}`);
    res
      .status(500)
      .json({ error: `error in getRecommendProductController: ${error}` });
  }
};

export const getCategoryProductsController = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.status(200).json({ products });
  } catch (error) {
    console.log(`error in getCategoryProductsController controller: ${error}`);
    res
      .status(500)
      .json({ error: `error in getCategoryProductsController: ${error}` });
  }
};

export const toggleFeaturedProductController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: "Products not found"});
    product.isfeatured = !product.isfeatured;
    const updatedProduct = await product.save();
    updateFeaturedProductsCache();
    res.status(201).json({updatedProduct});
  } catch (error){
    console.log(`error in getCategoryProductsController controller: ${error}`);
    res
      .status(500)
      .json({ error: `error in getCategoryProductsController: ${error}` });
  }
};


const updateFeaturedProductsCache = async ()=>{
  try {
    const featuredProducts = await Product.find({isfeatured: true}).lean();
    redis.set('featured_Products',JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(`error in updating featured product: ${error}`);
  }
}