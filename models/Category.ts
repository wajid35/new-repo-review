// lib/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ {
    question: string;
    answer: string;
}

export interface ICategory extends Document {
    name: string;
    image: {
        url: string;
        fileId: string;
        name: string;
    };
    faqs: IFAQ[];
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema: Schema = new Schema({
    question: {
        type: String,
        required: [true, 'FAQ question is required'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'FAQ answer is required'],
        trim: true
    }
}, { _id: false });

const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    image: {
        url: {
            type: String,
            required: [true, 'Image URL is required']
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required']
        },
        name: {
            type: String,
            required: [true, 'File name is required']
        }
    },
    faqs: {
        type: [FAQSchema],
        default: []
    }
}, {
    timestamps: true
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);