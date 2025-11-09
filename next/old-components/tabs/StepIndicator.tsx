'use client';

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    title: string;
    description: string;
  }>;
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step Circle */}
          <div className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index === currentStep 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step Text */}
            <div className="ml-3 min-w-0 flex-1">
              <div className={`text-sm font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </div>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <div
                className={`h-px ${
                  index < currentStep ? 'bg-primary' : 'bg-muted-foreground/25'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 