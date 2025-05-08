import mongoose from 'mongoose';

const AdminModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_Admin: {
      type: Boolean,
      default: false,
    },
    is_Verified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: '',
    },
    category: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sales',
      },
    ],
  },

  { timestamps: true }
);
const adminSchema = mongoose.model('admin', AdminModel);
export default adminSchema;
