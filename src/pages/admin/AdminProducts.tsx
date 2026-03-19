import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Upload, X, Save, Package, DollarSign, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  inventory_quantity: number;
  track_inventory: boolean;
  installation_available: boolean;
  installation_charge: number;
  installation_description?: string;
  main_image_url?: string;
  gallery_images?: string[];
  category?: string;
  brand?: string;
  is_active: boolean;
  is_featured: boolean;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const emptyProduct: Product = {
    id: "",
    name: "",
    slug: "",
    description: "",
    short_description: "",
    sku: "",
    price: 0,
    compare_at_price: undefined,
    inventory_quantity: 0,
    track_inventory: true,
    installation_available: false,
    installation_charge: 0,
    installation_description: "",
    main_image_url: "",
    gallery_images: [],
    category: "",
    brand: "",
    is_active: true,
    is_featured: false,
  };

  const [formData, setFormData] = useState<Product>(emptyProduct);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const productData = {
        ...formData,
        slug,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData(emptyProduct);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "main" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("electroobuddy")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("electroobuddy")
        .getPublicUrl(filePath);

      if (field === "main") {
        setFormData((prev) => ({ ...prev, main_image_url: urlData.publicUrl }));
      } else {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...(prev.gallery_images || []), urlData.publicUrl],
        }));
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-6 mb-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package size={20} />
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description</label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="input"
                      rows={2}
                      placeholder="Brief description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={4}
                      placeholder="Detailed product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input"
                        placeholder="e.g., Switches"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="input"
                        placeholder="e.g., Anchor"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input"
                      placeholder="Stock keeping unit"
                    />
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <DollarSign size={20} />
                    Pricing & Inventory
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Compare At Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || undefined })}
                      className="input"
                      placeholder="Original price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Inventory Quantity</label>
                    <input
                      type="number"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData({ ...formData, inventory_quantity: parseInt(e.target.value) || 0 })}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="track_inventory"
                      checked={formData.track_inventory}
                      onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="track_inventory" className="text-sm">Track Inventory</label>
                  </div>

                  {/* Installation Service */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Installation Service</h4>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="installation_available"
                        checked={formData.installation_available}
                        onChange={(e) => setFormData({ ...formData, installation_available: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="installation_available" className="text-sm">Installation Available</label>
                    </div>

                    {formData.installation_available && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Installation Charge (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.installation_charge}
                            onChange={(e) => setFormData({ ...formData, installation_charge: parseFloat(e.target.value) || 0 })}
                            className="input"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="mt-2">
                          <label className="block text-sm font-medium mb-2">Installation Description</label>
                          <textarea
                            value={formData.installation_description}
                            onChange={(e) => setFormData({ ...formData, installation_description: e.target.value })}
                            className="input"
                            rows={2}
                            placeholder="Describe installation service"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <ImageIcon size={20} />
                  Product Images
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Main Image</label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {formData.main_image_url ? (
                        <div className="relative">
                          <img src={formData.main_image_url} alt="Main" className="max-h-48 mx-auto rounded" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, main_image_url: "" })}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "main")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Gallery Images</label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <label className="cursor-pointer block text-center mb-3">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-xs">Click to upload more images</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "gallery")}
                          className="hidden"
                        />
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.gallery_images?.map((img, index) => (
                          <div key={index} className="relative aspect-square">
                            <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="is_active" className="text-sm">Active (Visible on website)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="is_featured" className="text-sm">Featured Product</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData(emptyProduct);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Products List */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Inventory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Installation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.main_image_url && (
                          <img src={product.main_image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.short_description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {product.short_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.category || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">₹{product.price.toFixed(2)}</div>
                      {product.compare_at_price && (
                        <div className="text-xs text-muted-foreground line-through">₹{product.compare_at_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${product.inventory_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.track_inventory ? `${product.inventory_quantity} in stock` : 'Not tracked'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.installation_available ? (
                        <span className="text-sm text-green-600">₹{product.installation_charge}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {product.is_active && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                        )}
                        {product.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-muted rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-destructive hover:text-white rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default AdminProducts;
