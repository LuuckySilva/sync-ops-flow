import { toast } from "@/hooks/use-toast";

export const useToastFeedback = () => {
  const showSuccess = (message: string) => {
    toast({
      title: "✓ Sucesso",
      description: message,
      variant: "default",
    });
  };

  const showError = (message: string) => {
    toast({
      title: "✗ Erro",
      description: message,
      variant: "destructive",
    });
  };

  const showInfo = (message: string) => {
    toast({
      title: "ℹ Informação",
      description: message,
    });
  };

  const showWarning = (message: string) => {
    toast({
      title: "⚠ Atenção",
      description: message,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
