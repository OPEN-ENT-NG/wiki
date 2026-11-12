import './AIRenderPreview.css';

export interface AIRenderPreviewProps {
  title: string;
}

export const AIRenderPreview = ({ title }: AIRenderPreviewProps) => {
  return (
    <div className="ai-render-type-preview">
      <span className="ai-render-type-preview__title">{title}</span>
      <div className="ai-render-type-preview__body-line1">&nbsp;</div>
      <div className="ai-render-type-preview__body-line2">&nbsp;</div>
    </div>
  );
};
