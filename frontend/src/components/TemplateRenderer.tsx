import React from 'react';
import MinimalDevTemplate from '../templates/MinimalDevTemplate';
import OnePageScroll from '../templates/OnePageScroll';
import StudentAcademic from '../templates/StudentAcademic';
import CreativeDesigner from '../templates/CreativeDesigner';
import CorporateProfessional from '../templates/CorporateProfessional';
import DarkModern from '../templates/DarkModern';
import { transformPortfolioData, getDefaultTheme } from '../utils/dataTransformer';

interface TemplateRendererProps {
  templateId: string;
  data: any;
  theme?: any;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, data, theme }) => {
  // Transform data to match template requirements
  const transformedData = transformPortfolioData(data, templateId);
  const templateTheme = theme || getDefaultTheme();

  switch (templateId) {
    case 'minimal-dev':
      return <MinimalDevTemplate data={transformedData} theme={templateTheme} />;
    case 'one-page-scroll':
      return <OnePageScroll data={transformedData} theme={templateTheme} />;
    case 'student-academic':
      return <StudentAcademic data={transformedData} theme={templateTheme} />;
    case 'creative-designer':
      return <CreativeDesigner data={transformedData} theme={templateTheme} />;
    case 'corporate-professional':
      return <CorporateProfessional data={transformedData} theme={templateTheme} />;
    case 'dark-modern':
      return <DarkModern data={transformedData} theme={templateTheme} />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Template Not Found</h2>
            <p className="text-gray-600">The template "{templateId}" is not available.</p>
          </div>
        </div>
      );
  }
};

export default TemplateRenderer;
