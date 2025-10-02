import { Loader2 } from "lucide-react";
import { useNavigation } from "react-router";

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Cargando...</span>
          </div>
        </div>
      )}

      <div className={isLoading ? "blur-sm pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}
