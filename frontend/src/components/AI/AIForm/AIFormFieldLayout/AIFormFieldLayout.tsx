import { Flex } from '@edifice.io/react';
import './AIFormFieldLayout.css';

export interface AIFormFieldLayoutProps {
  title: string;
  number?: number;
  description?: string;
  withBorder?: boolean;
  children: React.ReactNode;
}

const AIFormFieldLayout = ({
  title,
  number,
  description,
  withBorder = false,
  children,
}: AIFormFieldLayoutProps) => {
  const extraClasses = withBorder && 'ai-form-field-border';

  return (
    <div className={`ai-form-field ${extraClasses}`}>
      <Flex>
        {number && <span className="ai-form-field__number">{number}</span>}
        <h3 className="ai-form-field__title">{title}</h3>
      </Flex>
      {description && (
        <div className="ai-form-field__description">{description}</div>
      )}
      <div className="ai-form-field__input">{children}</div>
    </div>
  );
};

export default AIFormFieldLayout;
