
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface DesignsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  categories: string[];
}

const DesignsFilters: React.FC<DesignsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  categories
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search designs by name, EAN, SKU, or CAD software..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="static">Static</SelectItem>
          <SelectItem value="personalized">Personalized</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DesignsFilters;
