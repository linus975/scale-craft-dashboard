
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCategoryManager = (form: any) => {
  const [categories, setCategories] = useState<string[]>([
    'Household',
    'Toys',
    'Tools',
    'Decoration',
    'Accessories',
    'Other'
  ]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  
  const { toast } = useToast();

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
    setEditingCategoryValue(currentCategory);
  };

  const handleSaveEditCategory = () => {
    if (editingCategory && editingCategoryValue && editingCategory !== editingCategoryValue) {
      setCategories(prev => prev.map(cat => cat === editingCategory ? editingCategoryValue : cat));
      form.setValue('category', editingCategoryValue);
      toast({
        title: "Category renamed",
        description: `Category renamed to "${editingCategoryValue}".`,
      });
    }
    setEditingCategory(null);
    setEditingCategoryValue('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryValue('');
  };

  const handleAddCategory = () => {
    setShowAddCategoryDialog(true);
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
      setShowAddCategoryDialog(false);
      setNewCategoryName('');
    }
  };

  const handleCancelAddCategory = () => {
    setShowAddCategoryDialog(false);
    setNewCategoryName('');
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

  return {
    categories,
    editingCategory,
    showAddCategoryDialog,
    newCategoryName,
    editingCategoryValue,
    setEditingCategoryValue,
    setNewCategoryName,
    setShowAddCategoryDialog,
    handleStartEditCategory,
    handleSaveEditCategory,
    handleCancelEditCategory,
    handleAddCategory,
    handleSaveNewCategory,
    handleCancelAddCategory,
    handleDeleteCategory
  };
};
