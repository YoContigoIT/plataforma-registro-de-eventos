export function FormField({
  children,
  error,
  id,
}: {
  children: React.ReactNode;
  error?: string[];
  id: string;
}) {
  return (
    <div className="space-y-1">
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
