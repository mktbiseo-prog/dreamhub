"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { updateProductSchema } from "@/lib/validations";
import { CATEGORIES } from "@/lib/types";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/types";

interface EditProductFormProps {
  storyId: string;
  productId: string;
  product: Product;
}

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

export function EditProductForm({ storyId, productId, product }: EditProductFormProps) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState((product.price / 100).toFixed(2));
  const [whyIMadeThis, setWhyIMadeThis] = useState(product.whyIMadeThis || "");
  const [category, setCategory] = useState(product.category || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = updateProductSchema.safeParse({
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

    startTransition(async () => {
      try {
        await updateProduct(productId, storyId, result.data);
      } catch (err) {
        setErrors({
          _form:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      try {
        await deleteProduct(productId, storyId);
      } catch (err) {
        setErrors({
          _form: err instanceof Error ? err.message : "Failed to delete.",
        });
        setShowDeleteConfirm(false);
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Update your product information and pricing.
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

        {/* Why I Made This */}
        <Card>
          <CardHeader>
            <CardTitle>Why I Made This</CardTitle>
            <CardDescription>
              Connect this product to your dream. Tell supporters how this
              product is part of your journey.
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
        {errors._form && (
          <div className="rounded-card border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {errors._form}
          </div>
        )}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white shadow-lg hover:from-brand-700 hover:to-orange-600 sm:w-auto sm:min-w-[240px]"
          >
            {isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Delete Section */}
      <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this product. All associated orders and reviews
              will also be removed. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete This Product
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-card bg-red-50 p-4 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Are you sure you want to delete &quot;{product.title}&quot;?
                  </p>
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    All associated orders and reviews will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
