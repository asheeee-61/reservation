import { useState } from 'react';
import { Stepper, Step, StepLabel, Typography, Container, Card, CardContent, Box } from '@mui/material';
import DateStep from './DateStep';
import GuestStep from './GuestStep';
import TimeStep from './TimeStep';
import DetailsStep from './DetailsStep';
import ConfirmationStep from './ConfirmationStep';
import SuccessStep from './SuccessStep';

const steps = ['Date', 'Guests', 'Time', 'Details', 'Confirmation'];

export default function ReservationStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const onConfirmSuccess = () => setIsSuccess(true);

  if (isSuccess) {
    return <SuccessStep />;
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0: return <DateStep onNext={handleNext} />;
      case 1: return <GuestStep onNext={handleNext} onBack={handleBack} />;
      case 2: return <TimeStep onNext={handleNext} onBack={handleBack} />;
      case 3: return <DetailsStep onNext={handleNext} onBack={handleBack} />;
      case 4: return <ConfirmationStep onSuccess={onConfirmSuccess} onBack={handleBack} />;
      default: return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Reserve a Table
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box>
            {getStepContent(activeStep)}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
