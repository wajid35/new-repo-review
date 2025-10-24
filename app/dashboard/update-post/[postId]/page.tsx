"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Star, MessageSquare, AlertCircle, ThumbsUp, ThumbsDown, Loader2, Plus } from 'lucide-react';
import axios from 'axios';
import FileUpload from '@/app/components/FileUpload';

// Constants for affiliate buttons
const MAX_AFFILIATE_BUTTONS = 10;
const MIN_AFFILIATE_BUTTONS = 1;

// --- INTERFACES ---

interface IAffiliateButton {
    link: string;
    text: string;
}

interface RedditReview {
    comment: string;
    tag: 'positive' | 'negative' | 'neutral';
    link: string;
    author: string;
    subreddit: string;
}

interface LikeDislikePoint {
    heading: string;
    points: string[];
}

interface LikesDislikesData {
    likes: LikeDislikePoint[];
    dislikes: LikeDislikePoint[];
}

interface IProduct {
    _id?: string;
    productTitle: string;
    productDescription: string;
    productPrice: string;
    // UPDATED: Replaced single link/text with array
    affiliateButtons: IAffiliateButton[];
    //
    productScore: number;
    productPhotos: string[];
    redditReviews?: RedditReview[];
    category: string;
    productRank?: number;
    likesAndDislikes?: LikesDislikesData;
}

interface Category {
    _id: string;
    name: string;
    image: UploadResponse;
    createdAt: string;
    updatedAt: string;
}

interface UploadResponse {
    url: string;
    fileId?: string;
    name?: string;
}

// --- COMPONENT START ---

const UpdatePost: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const postId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingLikesDislikes, setIsGeneratingLikesDislikes] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [redditReviewsInput, setRedditReviewsInput] = useState('[]');
    const [formData, setFormData] = useState<IProduct>({
        productTitle: '',
        productDescription: '',
        productPrice: '',
        // UPDATED: Use affiliateButtons array
        affiliateButtons: [{ link: '', text: '' }],
        //
        productScore: 50,
        productPhotos: [],
        redditReviews: [],
        category: '',
        productRank: undefined,
        likesAndDislikes: undefined,
    });

    const [reviewPercentages, setReviewPercentages] = useState({
        positive: 0,
        negative: 0,
        neutral: 0
    });

    // --- DATA FETCHING ---

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('/api/categories');
            const result = await response.json();
            if (result.success) {
                setCategories(result.data);
            } else {
                console.error('Failed to fetch categories:', result.error);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            if (postId) {
                try {
                    setLoading(true);
                    
                    const fullId = postId as string;
                    const lastDashIndex = fullId.lastIndexOf('-');
                    let productId = fullId;

                    if (lastDashIndex !== -1) {
                        productId = fullId.substring(0, lastDashIndex);
                    }

                    const response = await fetch(`/api/auth/post/${productId}`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Product not found');
                    }

                    const data = await response.json();
                    const postData = data.data || data;

                    // AFFILIATE BUTTONS LOGIC: Ensure data structure is correctly loaded
                    let affiliateButtons: IAffiliateButton[] = [];
                    if (Array.isArray(postData.affiliateButtons) && postData.affiliateButtons.length > 0) {
                        affiliateButtons = postData.affiliateButtons.map((btn: Partial<IAffiliateButton>) => ({
                            link: typeof btn?.link === 'string' ? btn.link : '',
                            text: typeof btn?.text === 'string' ? btn.text : ''
                        }));
                    } else {
                         // Default to one empty button if array is missing or empty
                        affiliateButtons = [{ link: '', text: '' }];
                    }

                    const cleanedPostData = {
                        ...postData,
                        productPhotos: postData.productPhotos || [],
                        redditReviews: postData.redditReviews || [],
                        category: postData.category || '',
                        affiliateButtons, // Use the processed buttons
                    };

                    setFormData(cleanedPostData as IProduct);
                    setRedditReviewsInput(JSON.stringify(postData.redditReviews || [], null, 2));
                } catch (err) {
                    console.error('Error fetching post:', err);
                    setError(err instanceof Error ? err.message : 'Product not found');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPost();
        fetchCategories();
    }, [postId]);

    // --- AFFILIATE BUTTON HANDLERS ---

    const handleAffiliateButtonChange = (index: number, field: 'link' | 'text', value: string) => {
        setFormData(prev => {
            const newButtons = [...prev.affiliateButtons];
            newButtons[index] = {
                ...newButtons[index],
                [field]: value,
            };
            return { ...prev, affiliateButtons: newButtons };
        });
    };

    const handleAddAffiliateButton = () => {
        if (formData.affiliateButtons.length >= MAX_AFFILIATE_BUTTONS) {
            alert(`Maximum ${MAX_AFFILIATE_BUTTONS} affiliate buttons allowed.`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            affiliateButtons: [...prev.affiliateButtons, { link: '', text: '' }]
        }));
    };

    const handleRemoveAffiliateButton = (index: number) => {
        if (formData.affiliateButtons.length <= MIN_AFFILIATE_BUTTONS) {
            alert(`At least ${MIN_AFFILIATE_BUTTONS} affiliate button is required.`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            affiliateButtons: prev.affiliateButtons.filter((_, i) => i !== index)
        }));
    };

    // --- OTHER HANDLERS (Simplified for brevity) ---

    // ... (handleRemoveImage, handleImageUploadSuccess, handleImageUploadProgress, etc. remain the same)
    const handleRemoveImage = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            productPhotos: prev.productPhotos.filter((_, i) => i !== idx)
        }));
    };
    
    const handleImageUploadSuccess = (index: number, response: UploadResponse) => {
        setFormData(prev => {
            const newPhotos = [...(prev.productPhotos || [])];
            if (index < newPhotos.length) {
                newPhotos[index] = response.url;
            } else {
                newPhotos.push(response.url);
            }
            return { ...prev, productPhotos: newPhotos };
        });
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
    };

    const handleImageUploadProgress = (index: number, progress: number) => {
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
    };

    const generateLikesAndDislikes = async () => {
        let reviews: RedditReview[] = [];
        try {
            if (redditReviewsInput.trim()) {
                reviews = JSON.parse(redditReviewsInput);
            }
        } catch {
            alert('Please enter valid JSON for Reddit reviews');
            return;
        }

        if (reviews.length === 0) {
            alert('Please add Reddit reviews first');
            return;
        }

        setIsGeneratingLikesDislikes(true);

        try {
            const response = await axios.post('/api/generate-likes-dislikes', {
                reviews: reviews,
                productTitle: formData.productTitle,
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    likesAndDislikes: response.data.data
                }));
                alert('Likes and Dislikes generated successfully!');
            } else {
                alert('Failed to generate likes and dislikes: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error generating likes and dislikes:', error);
            if (axios.isAxiosError(error)) {
                alert(`Error: ${error.response?.data?.error || 'Failed to generate likes and dislikes'}`);
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsGeneratingLikesDislikes(false);
        }
    };
    
    const calculateProductRank = () => {
        let redditReviews: RedditReview[] = [];
        try {
            if (redditReviewsInput.trim()) {
                redditReviews = JSON.parse(redditReviewsInput);
            }
        } catch {
            // ignore parse error
        }
        const total = redditReviews.length;
        const positive = redditReviews.filter(r => r.tag === 'positive').length;
        const neutral = redditReviews.filter(r => r.tag === 'neutral').length;
        const positivePct = total > 0 ? (positive / total) * 100 : 0;
        const neutralPct = total > 0 ? (neutral / total) * 100 : 0;
        const rank = Math.round((formData.productScore * 0.3) + (positivePct * 0.5) + (neutralPct * 0.2));
        setFormData(prev => ({ ...prev, productRank: rank }));
        return rank;
    };
    
    const canGenerateLikesDislikes = () => {
        try {
            if (redditReviewsInput.trim()) {
                const reviews = JSON.parse(redditReviewsInput);
                return Array.isArray(reviews) && reviews.length > 0;
            }
        } catch {
            return false;
        }
        return false;
    };
    
    // --- SUBMIT HANDLER ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. AFFILIATE BUTTON VALIDATION (Client-side)
        const validAffiliateButtons = formData.affiliateButtons.filter(btn =>
            btn.link.trim().length > 0 && btn.text.trim().length > 0
        );

        if (validAffiliateButtons.length < MIN_AFFILIATE_BUTTONS) {
            alert(`At least one valid affiliate button is required (both link and text must be filled).`);
            return;
        }

        if (validAffiliateButtons.length > MAX_AFFILIATE_BUTTONS) {
            alert(`Maximum ${MAX_AFFILIATE_BUTTONS} affiliate buttons allowed.`);
            return;
        }

        // Validate URLs and text length
        for (const btn of validAffiliateButtons) {
            try {
                new URL(btn.link.trim());
            } catch {
                alert(`Invalid affiliate button URL format: "${btn.link}"`);
                return;
            }

            if (btn.text.trim().length > 50) {
                alert(`Affiliate button text must be less than 50 characters. Issue in: "${btn.text}"`);
                return;
            }
        }
        
        const cleanedAffiliateButtons = validAffiliateButtons.map(btn => ({
            link: btn.link.trim(),
            text: btn.text.trim()
        }));
        
        // 2. REDDIT REVIEWS PARSING
        let redditReviews: RedditReview[] = [];
        try {
            const parsed = JSON.parse(redditReviewsInput);
            if (!Array.isArray(parsed)) throw new Error('Not an array');
            redditReviews = parsed.map((p) => ({
                comment: String(p.comment ?? p.commentText ?? ''),
                tag: p.tag === 'positive' || p.tag === 'negative' ? p.tag : 'neutral',
                link: String(p.link ?? p.permalink ?? ''),
                author: typeof p.author === 'string' ? p.author : '',
                subreddit: typeof p.subreddit === 'string' ? p.subreddit : '',
            }));
        } catch {
            alert('Reddit reviews must be a valid JSON array.');
            return;
        }

        // 3. API CALL
        try {
            setUpdateLoading(true);
            const response = await fetch('/api/auth/post', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: postId,
                    ...formData,
                    productPhotos: formData.productPhotos.filter(photo => photo.trim() !== ''),
                    redditReviews,
                    affiliateButtons: cleanedAffiliateButtons, // SEND CLEANED BUTTONS
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update post');
            }

            alert('Post updated successfully! 🎉');
            router.push('/dashboard/allposts');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update post');
        } finally {
            setUpdateLoading(false);
        }
    };
    
    // --- JSX (Loading/Error) ---
    
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Update Post</h1>
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Update Post</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button
                        onClick={() => router.push('/dashboard/allposts')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                        Back to All Posts
                    </button>
                </div>
            </div>
        );
    }

    // --- JSX (Main Form) ---

    return (
        <div className="min-h-screen bg-gray-50 w-full flex justify-center">
            <div className="max-w-4xl w-full p-6">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard/allposts')}
                        className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2 cursor-pointer"
                    >
                        ← Back to All Posts
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Update Post</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Review Percentages... (JSX remains the same) */}
                    <div className="flex gap-6 justify-center mb-8">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-green-600">Positive</span>
                            <span className="text-lg">{reviewPercentages.positive}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-red-600">Negative</span>
                            <span className="text-lg">{reviewPercentages.negative}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-gray-600">Neutral</span>
                            <span className="text-lg">{reviewPercentages.neutral}%</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category... (JSX remains the same) */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772]"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Product Images... (JSX remains the same) */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Product Images</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {formData.productPhotos && formData.productPhotos.length > 0 && (
                                    formData.productPhotos.map((url, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Product ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                                                onClick={() => handleRemoveImage(idx)}
                                                title="Remove image"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Image</h4>
                                <FileUpload
                                    onSuccess={(response) => handleImageUploadSuccess((formData.productPhotos || []).length, response)}
                                    onProgress={(progress) => handleImageUploadProgress((formData.productPhotos || []).length, progress)}
                                    FileType="image"
                                />
                                {formData.productPhotos && uploadProgress[formData.productPhotos.length] > 0 && uploadProgress[formData.productPhotos.length] < 100 && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#FF5F1F] h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress[formData.productPhotos.length]}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{uploadProgress[formData.productPhotos.length]}% uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Information (Title, Price)... (JSX remains the same) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Title *</label>
                                <input
                                    type="text"
                                    value={formData.productTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, productTitle: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Product Price *</label>
                                <input
                                    type="text"
                                    value={formData.productPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, productPrice: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772]"
                                    placeholder="$99.99"
                                    required
                                />
                            </div>
                        </div>

                        {/* Product Description... (JSX remains the same) */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Product Description *</label>
                            <textarea
                                value={formData.productDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#f59772]"
                                required
                            />
                        </div>

                        {/* --- NEW AFFILIATE BUTTONS SECTION --- */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Affiliate Buttons (Min 1, Max 10) *</label>
                            <div className="space-y-4">
                                {formData.affiliateButtons.map((btn, index) => (
                                    <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="url"
                                                    value={btn.link}
                                                    onChange={(e) => handleAffiliateButtonChange(index, 'link', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772]"
                                                    placeholder="Affiliate Link (e.g., https://amazon.com/...)"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={btn.text}
                                                    onChange={(e) => handleAffiliateButtonChange(index, 'text', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772]"
                                                    placeholder="Button Text (Max 50 chars)"
                                                    maxLength={50}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {formData.affiliateButtons.length > MIN_AFFILIATE_BUTTONS && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAffiliateButton(index)}
                                                className="self-center bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                title="Remove Button"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddAffiliateButton}
                                disabled={formData.affiliateButtons.length >= MAX_AFFILIATE_BUTTONS}
                                className="mt-4 bg-lime-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-lime-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                Add Affiliate Button
                            </button>
                        </div>
                        {/* --- END NEW AFFILIATE BUTTONS SECTION --- */}

                        {/* Reddit Reviews as JSON Array... (JSX remains the same) */}
                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Reddit Reviews (JSON Array)
                            </label>
                            <textarea
                                value={redditReviewsInput}
                                onChange={e => setRedditReviewsInput(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f59772] font-mono"
                                rows={8}
                                placeholder={`[
  {
    "comment": "Great product!",
    "tag": "positive",
    "link": "https://reddit.com/...",
    "author": "user123",
    "subreddit": "subredditName"
  }
]`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter a JSON array of reviews. Each review should have <code>comment</code>, <code>tag</code>, <code>link</code>, <code>author</code>, and <code>subreddit</code>.
                            </p>
                        </div>

                        {/* Generate Likes and Dislikes Button... (JSX remains the same) */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={generateLikesAndDislikes}
                                disabled={!canGenerateLikesDislikes() || isGeneratingLikesDislikes}
                                className="bg-purple-500 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGeneratingLikesDislikes ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <ThumbsUp className="w-5 h-5" />
                                        <ThumbsDown className="w-5 h-5" />
                                        Generate Likes & Dislikes
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Display Generated Likes and Dislikes... (JSX remains the same) */}
                        {formData.likesAndDislikes && (
                            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Likes & Dislikes</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Likes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ThumbsUp className="w-5 h-5 text-green-600" />
                                            <h4 className="text-lg font-semibold text-green-600">Likes</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.likesAndDislikes.likes.map((like, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-green-200">
                                                    <h5 className="font-semibold text-gray-800 mb-2">{like.heading}</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {like.points.map((point, pIdx) => (
                                                            <li key={pIdx} className="text-sm text-gray-600">{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dislikes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ThumbsDown className="w-5 h-5 text-red-600" />
                                            <h4 className="text-lg font-semibold text-red-600">Dislikes</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.likesAndDislikes.dislikes.map((dislike, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-red-200">
                                                    <h5 className="font-semibold text-gray-800 mb-2">{dislike.heading}</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {dislike.points.map((point, pIdx) => (
                                                            <li key={pIdx} className="text-sm text-gray-600">{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Product Score... (JSX remains the same) */}
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Product Score: <span className="text-lime-600 font-bold">{formData.productScore}/100</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={formData.productScore}
                                onChange={(e) => setFormData(prev => ({ ...prev, productScore: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #a3e635 0%, #a3e635 ${formData.productScore}%, #e5e7eb ${formData.productScore}%, #e5e7eb 100%)`
                                }}
                            />
                        </div>

                        {/* Product Rank... (JSX remains the same) */}
                        <div className="pt-4 flex flex-col items-start">
                            <button
                                type="button"
                                onClick={calculateProductRank}
                                className="bg-blue-500 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all mb-2"
                            >
                                Generate Product Rank{typeof formData.productRank === 'number' ? `: ${formData.productRank}%` : ''}
                            </button>
                        </div>

                        {/* Action Buttons... (JSX remains the same) */}
                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/allposts')}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer font-medium"
                                disabled={updateLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 cursor-pointer py-3 bg-[#FF5F1F] text-white rounded-lg hover:bg-[#f59772] disabled:opacity-50 font-medium"
                                disabled={updateLoading}
                            >
                                {updateLoading ? 'Updating...' : 'Update Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdatePost;