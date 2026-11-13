import { Flex } from '@edifice.io/react';
import './AIFormFieldLayout.css';

export interface AIFormFieldLayoutProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const AIFormFieldLayout = ({
  number,
  title,
  description,
  children,
}: AIFormFieldLayoutProps) => {
  return (
    <div className="ai-form-field">
      <Flex>
        <span className="ai-form-field__number">{number}</span>
        <h3 className="ai-form-field__title">{title}</h3>
      </Flex>
      <div className="ai-form-field__description">{description}</div>
      <div className="ai-form-field__input">{children}</div>
    </div>
  );
};

export default AIFormFieldLayout;
