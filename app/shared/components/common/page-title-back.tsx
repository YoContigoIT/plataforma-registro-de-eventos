import { ArrowLeft } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

interface PageTitleBackProps {
  title: string;
  href: string;
  subtitle?: string;
}

export const PageTitleBack: FC<PageTitleBackProps> = ({
  title,
  subtitle,
  href,
}) => {
  return (
    <div className="w-full py-6 px-6 bg-card/70 backdrop-blur-sm rounded-xl border border-border shadow-xs mb-6">
      <div className="flex items-start">
        <Link
          className="flex-shrink-0 mr-4 p-2 rounded-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-xs hover:shadow-sm border border-sidebar-border active:scale-95"
          to={href}
          aria-label="Volver atrás"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <h1 className="text-2xl font-bold text-card-foreground truncate">
              {title}
            </h1>
          </div>

          <p className="text-muted-foreground text-sm md:text-base">
            {subtitle ||
              "Completa la información del formulario a continuación"}
          </p>
        </div>
      </div>
    </div>
  );
};
