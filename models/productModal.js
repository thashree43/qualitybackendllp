import mongoose from 'mongoose';

const ProductModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'new_arrival'],
      default: 'in_stock',
    },
    image: {
      type: [String],
      required: true,
    },
    admindata: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
      },
    ],
    category: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductModel);
