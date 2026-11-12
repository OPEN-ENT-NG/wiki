import { Stepper } from '@edifice.io/react';
import './AIStepHeader.css';

export interface AIStepHeaderProps {
  title: string;
  description: string;
  currentStep: number;
  nbSteps: number;
}

export const AIStepHeader = ({
  title,
  description,
  currentStep,
  nbSteps,
}: AIStepHeaderProps) => {
  return (
    <div className="ai-step-header">
      <h2 className="ai-step-header__title">{title}</h2>
      <p className="ai-step-header__description">{description}</p>
      <Stepper currentStep={currentStep} nbSteps={nbSteps} />
    </div>
  );
};
