import { Flex } from '@edifice.io/react';
import './AIStepLayout.css';

export interface AIStepLayoutProps {
  children: React.ReactNode;
}

export const AIStepLayout = ({ children }: AIStepLayoutProps) => {
  return (
    <Flex className="ai-step-layout" justify="center">
      <div className="ai-step-layout__content col-12 col-md-10 col-lg-8">
        {children}
      </div>
    </Flex>
  );
};
