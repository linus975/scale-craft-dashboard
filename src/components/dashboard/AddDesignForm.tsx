import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import { useDesigns } from '@/hooks/useDesigns';
import { useToast } from '@/hooks/use-toast';

interface AddDesignFormProps {
  onCancel: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
}

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
}

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'main', name: 'Main Part', files: [], partType: 'static' }
  ]);
  const [activePart, setActivePart] = useState<string>('main');
  const [categories, setCategories] = useState<string[]>([
    'Household',
    'Toys',
    'Tools',
    'Decoration',
    'Accessories',
    'Other'
  ]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  
  const { createDesign } = useDesigns();
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      trackingType: '',
      eanNumber: '',
      description: '',
      category: ''
    }
  });

  const trackingType = form.watch('trackingType');

  const handlePreviewImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setPreviewImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreviewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now() + Math.random() + '',
        name: file.name,
        type: getFileType(file.name),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: `temp/${file.name}`,
        originalName: file.name,
        partId: partId || activePart,
        designType: 'static' as const
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setUploading(false);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) were successfully uploaded.`,
      });
    }, 1000);

    event.target.value = '';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'gcode':
        return 'G-Code File';
      default:
        return 'Unknown';
    }
  };

  const handleFileRemove = (file: any) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "File deleted",
      description: `${file.name} was successfully deleted.`,
    });
  };

  const handleFileDownload = (file: any) => {
    console.log('Downloading file:', file.name);
  };

  const handlePartParametersChange = (partId: string, parameters: { sketchName: string; replacementValue: string }) => {
    setDesignParts(prev => prev.map(part => 
      part.id === partId 
        ? { 
            ...part, 
            parameters: { 
              ...part.parameters, 
              sketchName: parameters.sketchName,
              replacementValue: parameters.replacementValue
            } 
          }
        : part
    ));
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
    setActivePart(partId);
  };

  const handleAddPart = (name: string) => {
    const newPart: DesignPart = {
      id: Date.now().toString(),
      name,
      files: [],
      partType: 'static'
    };
    setDesignParts(prev => [...prev, newPart]);
    setActivePart(newPart.id);
  };

  const handleRemovePart = (partId: string) => {
    if (designParts.length <= 1) return;
    
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    setUploadedFiles(prev => prev.filter(file => file.partId !== partId));
    
    if (activePart === partId) {
      setActivePart(designParts[0].id);
    }
  };

  const handleRenamePart = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const handlePartTypeChange = (partId: string, partType: 'static' | 'personalized') => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, partType } : part
    ));
  };

  const handlePartSoftwareChange = (partId: string, field: 'cadSoftware' | 'slicer', value: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, [field]: value } : part
    ));
  };

  const validatePartFiles = (part: DesignPart) => {
    const partFiles = uploadedFiles.filter(file => file.partId === part.id);
    const hasF3D = partFiles.some(file => file.name.toLowerCase().endsWith('.f3d'));
    const hasINI = partFiles.some(file => file.name.toLowerCase().endsWith('.ini'));
    const hasPersonalizedFiles = partFiles.some(file => 
      file.name.toLowerCase().endsWith('.f3d') || file.name.toLowerCase().endsWith('.ini')
    );
    
    return { hasF3D, hasINI, hasPersonalizedFiles };
  };

  const handleAddCategory = () => {
    setShowAddCategoryForm(true);
    setNewCategoryName('');
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName && newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories(prev => [...prev, newCategoryName.trim()]);
      form.setValue('category', newCategoryName.trim());
      toast({
        title: "Category added",
        description: `"${newCategoryName.trim()}" was added to categories.`,
      });
      setShowAddCategoryForm(false);
      setNewCategoryName('');
    }
  };

  const handleCancelAddCategory = () => {
    setShowAddCategoryForm(false);
    setNewCategoryName('');
  };

  const handleStartEditCategory = () => {
    const currentCategory = form.getValues('category');
    if (!currentCategory) {
      toast({
        title: "No category selected",
        description: "Please select a category to rename.",
        variant: "destructive",
      });
      return;
    }
    setEditingCategory(currentCategory);
    setEditCategoryName(currentCategory);
  };

  const handleSaveEditCategory = () => {
    if (editCategoryName && editCategoryName.trim() && !categories.includes(editCategoryName.trim()) && editCategoryName.trim() !== editingCategory) {
      setCategories(prev => prev.map(cat => cat === editingCategory ? editCategoryName.trim() : cat));
      form.setValue('category', editCategoryName.trim());
      toast({
        title: "Category renamed",
        description: `Category renamed to "${editCategoryName.trim()}".`,
      });
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = () => {
    const currentCategory = form.getValues('category');
    if (!currentCategory) {
      toast({
        title: "No category selected",
        description: "Please select a category to delete.",
        variant: "destructive",
      });
      return;
    }
    
    if (categories.length > 1) {
      setCategories(prev => prev.filter(cat => cat !== currentCategory));
      form.setValue('category', '');
      toast({
        title: "Category deleted",
        description: `"${currentCategory}" was removed from categories.`,
      });
    } else {
      toast({
        title: "Cannot delete category",
        description: "At least one category must remain.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
      const partFiles = uploadedFiles.filter(file => file.partId === activePart);
      
      const f3dFile = partFiles.find(file => file.name.toLowerCase().endsWith('.f3d'));
      const iniFile = partFiles.find(file => file.name.toLowerCase().endsWith('.ini'));
      const gcodeFile = partFiles.find(file => file.name.toLowerCase().endsWith('.gcode'));
      const stlFile = partFiles.find(file => file.name.toLowerCase().endsWith('.stl'));

      const designData = {
        name: data.name,
        tracking_type: data.trackingType,
        ean_number: data.eanNumber,
        description: data.description,
        category: data.category,
        design_type: currentPart?.partType || 'static',
        cad_file_path: f3dFile?.path || null,
        ini_file_path: iniFile?.path || null,
        gcode_file_path: gcodeFile?.path || null,
        preview_image_path: previewImage ? `preview/${previewImage.name}` : null,
        cad_software: currentPart?.cadSoftware || null,
        slicer: currentPart?.slicer || null,
        sketch_name: currentPart?.parameters?.sketchName || null,
        replacement_value: currentPart?.parameters?.replacementValue || null,
        version: 'v1.0'
      };

      console.log('Saving design with data:', designData);
      console.log('Uploaded files:', uploadedFiles);
      console.log('Design Parts:', designParts);

      await createDesign(designData);
      
      toast({
        title: "Design successfully created",
        description: `The design "${data.name}" was saved with all files.`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error creating design:', error);
      toast({
        title: "Error creating design",
        description: "There was an error saving the design.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Add Design</h3>
        <p className="text-sm text-gray-600">Create a new design with all required information and files.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Design Information */}
          <Card>
            <CardHeader>
              <CardTitle>Design Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of the design" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trackingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Type</FormLabel>
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
                  control={form.control}
                  name="eanNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EAN / SKU Number</FormLabel>
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
                  onDrop={handlePreviewImageDrop}
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
                  onChange={handlePreviewImageChange}
                  className="hidden"
                />
              </div>

              <FormField
                control={form.control}
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
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-1">
                      <div className="flex-1">
                        {editingCategory ? (
                          <div className="flex gap-1">
                            <Input
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              placeholder="Category name"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEditCategory();
                                }
                                if (e.key === 'Escape') {
                                  handleCancelEditCategory();
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleSaveEditCategory}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditCategory}
                            >
                              Cancel
                            </Button>
                          </div>
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
                      {!editingCategory && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleStartEditCategory}
                            title="Rename category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddCategory}
                            title="Add category"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                title="Delete category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the category "{form.getValues('category')}" for all products. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteCategory}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                    
                    {/* Add Category Form */}
                    {showAddCategoryForm && (
                      <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                        <Label htmlFor="newCategoryName" className="text-sm font-medium">
                          New Category Name
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="newCategoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNewCategory();
                              }
                              if (e.key === 'Escape') {
                                handleCancelAddCategory();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSaveNewCategory}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelAddCategory}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* File Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Files</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiPartFileManager
                uploadedFiles={uploadedFiles}
                loadingFiles={false}
                uploading={uploading}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                onFileDownload={handleFileDownload}
                onPartParametersChange={handlePartParametersChange}
                selectedPartId={selectedPartId}
                onPartSelect={handlePartSelect}
                designParts={designParts}
                activePart={activePart}
                onPartChange={setActivePart}
                onAddPart={handleAddPart}
                onRemovePart={handleRemovePart}
                onRenamePart={handleRenamePart}
                onPartTypeChange={handlePartTypeChange}
                onPartSoftwareChange={handlePartSoftwareChange}
                validatePartFiles={validatePartFiles}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Design
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
