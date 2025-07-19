import { productImages } from "../assets/imagedata"

export const data = [
  {
    productId: 1,
    companyName: "Florecien Technologies Inc",
    productName: "Fall Limited Edition Sneakers",
    productDescription:
      "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they’ll withstand everything the weather can offer.",
    productPrice: 250,
    isOnSale: true,
    salePercent: 0.5,
    amount: 0,
    images: productImages,
    thumbnails: productImages, // assuming same for demo
  },
  {
    productId: 2,
    companyName: "Florecien Technologies Inc",
    productName: "Spring Limited Edition Sneakers",
    productDescription:
      "These high-performance sneakers are designed to deliver exceptional comfort for your daily stride.",
    productPrice: 180,
    isOnSale: false,
    salePercent: 0,
    amount: 0,
    images: productImages,
    thumbnails: productImages,
  }
]