import { toast as shadcnToast } from "../components/ui/sonner";

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = "default",
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      if (variant === "destructive") {
        shadcnToast.error(title, { description });
      } else {
        shadcnToast.success(title, { description });
      }
    },
  };
}
