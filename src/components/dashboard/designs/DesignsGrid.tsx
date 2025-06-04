
import React from 'react';
import DesignCard from './DesignCard';

interface DesignsGridProps {
  filteredDesigns: any[];
  isSelectionMode: boolean;
  selectedDesigns: string[];
  onSelectDesign: (designId: string) => void;
  onConfigureDesign: (design: any) => void;
  onDownloadDesign: (design: any) => void;
}

const DesignsGrid: React.FC<DesignsGridProps> = ({
  filteredDesigns,
  isSelectionMode,
  selectedDesigns,
  onSelectDesign,
  onConfigureDesign,
  onDownloadDesign
}) => {
  console.log('DesignsGrid: Rendering with', filteredDesigns.length, 'designs');
  
  if (filteredDesigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No designs match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDesigns.map((design, index) => (
        <DesignCard
          key={design.id}
          design={design}
          index={index}
          isSelectionMode={isSelectionMode}
          selectedDesigns={selectedDesigns}
          onSelectDesign={onSelectDesign}
          onConfigureDesign={onConfigureDesign}
          onDownloadDesign={onDownloadDesign}
        />
      ))}
    </div>
  );
};

export default DesignsGrid;
