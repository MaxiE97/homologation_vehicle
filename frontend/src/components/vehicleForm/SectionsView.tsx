// src/components/vehicleForm/SectionsView.tsx
import React from 'react';
import SectionItem from './SectionItem';
import { sections as allSections } from '../../constants/vehicleFormSections';
import type { FormData, CollapsedSections } from '../../types/vehicleSpecs';

interface SectionsViewProps {
  formData: FormData;
  collapsedSections: CollapsedSections;
  onToggleSection: (sectionIndex: number) => void;
  onFieldChange: (fieldKey: string, value: string) => void;
}

const SectionsView: React.FC<SectionsViewProps> = ({
  formData,
  collapsedSections,
  onToggleSection,
  onFieldChange,
}) => {
  return (
    <div className="space-y-4">
      {allSections.map((section, sectionIndex) => (
        <SectionItem
          key={sectionIndex}
          section={section}
          isCollapsed={!!collapsedSections[sectionIndex]}
          formData={formData}
          onToggle={() => onToggleSection(sectionIndex)}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
};

export default SectionsView;