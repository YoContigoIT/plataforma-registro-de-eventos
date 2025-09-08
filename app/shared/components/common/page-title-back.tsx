import { ArrowLeft } from "lucide-react"
import type { FC } from "react"
import { Link } from "react-router"

interface PageTitleBackProps {
  title: string
  href: string
  subtitle?: string
}

export const PageTitleBack: FC<PageTitleBackProps> = ({
  title,
  subtitle,
  href,
}) => {
  return (
    <div className="py-5">
      <div className="flex items-center mb-2">
        <Link
          className="mr-2 text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-[#4D4D4D]"
          to={href}
        >
          <ArrowLeft className="h-8 w-8" />
        </Link>
        <h1 className="page-title">
          {title}
        </h1>
      </div>
      <span className="text-muted-foreground block ml-10">
        {subtitle || "Llena la información del formulario"}
      </span>
    </div>
  )
}