import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-eco-forest group-[.toaster]:border-[rgba(61,139,93,0.15)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-eco-sage",
          actionButton: "group-[.toast]:bg-eco-green group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-eco-bg group-[.toast]:text-eco-sage",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
