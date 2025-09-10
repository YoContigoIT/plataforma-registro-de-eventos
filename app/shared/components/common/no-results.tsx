interface NoResultsProps {
  message: string;
}

export function NoResults({ message }: NoResultsProps) {
  return (
    <div className="col-span-full flex items-center justify-center h-60 border border-dashed border-gray-300 rounded-md p-6">
      <div className="text-center">
        <svg
          className="w-12 h-12 text-gray-500 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.293 9.293a1 1 0 011.414 0L10 10.586l.293-.293a1 1 0 111.414 1.414l-1 1a1 1 0 01-1.414 0L10 11.414l-.293.293a1 1 0 01-1.414-1.414l1-1z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M10 3a7 7 0 100 14 7 7 0 000-14zm-1 7a1 1 0 112 0v3a1 1 0 11-2 0V10zm0-4a1 1 0 112 0v1a1 1 0 11-2 0V6z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {message}
        </p>
      </div>
    </div>
  );
}
