"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@dreamhub/ui";
import { createProductSchema } from "@/lib/validations";
import { CATEGORIES } from "@/lib/types";

interface CreateProductFormProps {
  storyId: string;
}

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

export function CreateProductForm({ storyId }: CreateProductFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [whyIMadeThis, setWhyIMadeThis] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImagesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = imageFiles.length + files.length;
    if (totalImages > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed",
      }));
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were skipped. Only images under 5MB are accepted.",
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }

    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = createProductSchema.safeParse({
      title,
      description,
      price,
      whyIMadeThis,
      category,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (imageFiles.length === 0) {
      setErrors({ images: "Please upload at least one product image" });
      return;
    }

    setIsSubmitting(true);

    // TODO: Upload images, then POST /api/stories/:storyId/products
    console.log("Product data:", {
      storyId,
      ...result.data,
      priceInCents: Math.round(Number(result.data.price) * 100),
      imageFiles,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert("Product created! (API not connected yet)");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Product Title */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Describe your product clearly. What is it and what makes it special?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              placeholder='e.g. "Sunrise Mug — Handmade Ceramic"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <div className="flex justify-between text-xs text-gray-400">
              {errors.title ? (
                <span className="text-red-500">{errors.title}</span>
              ) : (
                <span />
              )}
              <span>{title.length}/120</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              className="resize-y"
            />
            <div className="flex justify-between text-xs text-gray-400">
              {errors.description ? (
                <span className="text-red-500">{errors.description}</span>
              ) : (
                <span />
              )}
              <span>{description.length}/2,000</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="35.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7"
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-[8px] border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Select a category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>
            Upload up to 5 images. The first image will be used as the main
            product photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="group relative aspect-square">
                    <img
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full rounded-[8px] object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {imagePreviews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-600"
              >
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  Add images ({imagePreviews.length}/5)
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImagesChange}
              className="hidden"
            />

            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Why I Made This */}
      <Card>
        <CardHeader>
          <CardTitle>Why I Made This</CardTitle>
          <CardDescription>
            Connect this product to your dream. Tell supporters how this
            product is part of your journey. This is what makes Dream Store
            different.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="whyIMadeThis">Your Story</Label>
            <Textarea
              id="whyIMadeThis"
              placeholder="This product exists because..."
              rows={4}
              value={whyIMadeThis}
              onChange={(e) => setWhyIMadeThis(e.target.value)}
              maxLength={1000}
              className="resize-y text-base leading-relaxed"
            />
            <div className="flex justify-between text-xs text-gray-400">
              {errors.whyIMadeThis ? (
                <span className="text-red-500">{errors.whyIMadeThis}</span>
              ) : (
                <span />
              )}
              <span>{whyIMadeThis.length}/1,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white shadow-lg hover:from-brand-700 hover:to-orange-600 sm:w-auto sm:min-w-[240px]"
        >
          {isSubmitting ? "Adding Product..." : "Add Product to My Dream"}
        </Button>
        <p className="text-center text-xs text-gray-500">
          Your product will be listed under your dream story.
        </p>
      </div>
    </form>
  );
}
