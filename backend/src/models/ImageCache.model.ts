import mongoose, { Schema } from 'mongoose';

export interface IImageCache extends mongoose.Document {
  keyword: string;
  imageUrl: string;
  photographerName?: string;
  photographerLink?: string;
  createdAt: Date;
}

const ImageCacheSchema: Schema = new Schema({
  keyword: { type: String, required: true, unique: true, index: true },
  imageUrl: { type: String, required: true },
  photographerName: { type: String },
  photographerLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IImageCache>('ImageCache', ImageCacheSchema);
