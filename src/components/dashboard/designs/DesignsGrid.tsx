
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
