import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';

export const useToastMessage = () => {
  const toast = useToast();

  const showToast = ({
    message = '',
    description = null,
    action = 'attention',
    variant = 'solid',
    placement = 'bottom',
    duration = 2000,
  }) => {
    toast.show({
      placement,
      duration,
      render: ({id}) => {
        return (
          <Toast variant={variant} action={action} borderRadius="$xl">
            <VStack space="xs">
              <ToastTitle textAlign="center">{message}</ToastTitle>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </VStack>
          </Toast>
        );
      },
    });
  };
  return {showToast};
};
