
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Upload, Check, Settings } from 'lucide-react';

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color: string;
  machine: string;
}

interface DesignInformationSectionProps {
  control: Control<FormData>;
  trackingType: string;
  categories: string[];
  editingCategory: string | null;
  editingCategoryValue: string;
  showAddCategoryDialog: boolean;
  newCategoryName: string;
  previewImage: File | null;
  onStartEditCategory: () => void;
  onSaveEditCategory: () => void;
  onCancelEditCategory: () => void;
  onAddCategory: () => void;
  onSaveNewCategory: () => void;
  onCancelAddCategory: () => void;
  onDeleteCategory: () => void;
  onPreviewImageDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onPreviewImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setEditingCategoryValue: (value: string) => void;
  setNewCategoryName: (value: string) => void;
  setShowAddCategoryDialog: (show: boolean) => void;
  getValues: (field: string) => string;
}

const DesignInformationSection: React.FC<DesignInformationSectionProps> = ({
  control,
  trackingType,
  categories,
  editingCategory,
  editingCategoryValue,
  showAddCategoryDialog,
  newCategoryName,
  previewImage,
  onStartEditCategory,
  onSaveEditCategory,
  onCancelEditCategory,
  onAddCategory,
  onSaveNewCategory,
  onCancelAddCategory,
  onDeleteCategory,
  onPreviewImageDrop,
  onPreviewImageChange,
  setEditingCategoryValue,
  setNewCategoryName,
  setShowAddCategoryDialog,
  getValues
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Design Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="name"
          rules={{ required: "Design name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter design name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="trackingType"
            rules={{ required: "Tracking type is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tracking type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ean">EAN</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="eanNumber"
            rules={{ required: "EAN/SKU number is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>EAN / SKU Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter EAN / SKU number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Image Drop Zone */}
        <div className="space-y-2">
          <Label htmlFor="previewImage">Product Image</Label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={onPreviewImageDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('previewImage')?.click()}
          >
            {previewImage ? (
              <div className="space-y-2">
                <img
                  src={URL.createObjectURL(previewImage)}
                  alt="Preview"
                  className="max-h-32 mx-auto rounded"
                />
                <p className="text-sm text-gray-600">{previewImage.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">Drop image here or click to upload</p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
          <Input
            id="previewImage"
            type="file"
            accept="image/*"
            onChange={onPreviewImageChange}
            className="hidden"
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description of the design"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category with Icon Buttons */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  {editingCategory ? (
                    <Input
                      value={editingCategoryValue}
                      onChange={(e) => setEditingCategoryValue(e.target.value)}
                      placeholder="Category name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          onSaveEditCategory();
                        }
                        if (e.key === 'Escape') {
                          onCancelEditCategory();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="flex gap-1">
                  {/* Rename Category Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={editingCategory ? onSaveEditCategory : onStartEditCategory}
                    title={editingCategory ? "Save changes" : "Rename category"}
                  >
                    {editingCategory ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Add Category Button */}
                  <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onAddCategory}
                        title="Add category"
                        disabled={editingCategory !== null}
                        className={editingCategory ? 'text-gray-400' : ''}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Enter the name for the new category.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                onSaveNewCategory();
                              }
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={onCancelAddCategory}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={onSaveNewCategory}
                            disabled={!newCategoryName.trim()}
                          >
                            Add Category
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Delete Category Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 ${editingCategory ? 'text-gray-400' : ''}`}
                        title="Delete category"
                        disabled={editingCategory !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the category "{getValues('category')}" for all products. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={onDeleteCategory}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default DesignInformationSection;
