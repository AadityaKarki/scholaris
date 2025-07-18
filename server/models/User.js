import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

export default User;
