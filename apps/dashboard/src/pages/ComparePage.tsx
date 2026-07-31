import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CompareMatrix } from '../components/compare/CompareMatrix';
import { getToolBySlug, getRelatedTools, getAllTools } from '../lib/services/tool-service';

export const ComparePage: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  let slug = params.slug || '';
  if (!slug) {
    slug = location.pathname.replace(/^\/compare\//, '');
  }

  const primaryTool = getToolBySlug(slug) || getAllTools()[0];
  const relatedTools = getRelatedTools(primaryTool ? primaryTool.slug : '');
  const initialTools = primaryTool ? [primaryTool, ...relatedTools].slice(0, 3) : getAllTools().slice(0, 3);

  return <CompareMatrix initialTools={initialTools} />;
};

export default ComparePage;
