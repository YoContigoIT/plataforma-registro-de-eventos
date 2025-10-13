import { useLocation, useNavigate, useSearchParams } from "react-router";

interface BuilderReturn {
  getParamValue: (key: string) => string | null;
  handleSearchParams: (key: string, value: string, path?: string) => void;
  updateMultipleParams: (params: Record<string, string>) => void;
  removeParam: (key: string) => void;
  resetAllParams: () => void;
  resetAndSetParam: (key: string, value: string) => void;
  resetAllExcept: (keys: string[]) => void;
  searchParams: URLSearchParams;
}

export function useSearchParamsManager(): BuilderReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getParamValue = (key: string): string | null => {
    return searchParams.get(key);
  };

  const handleSearchParams = (
    key: string,
    value: string,
    path: string = location.pathname,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Use setSearchParams for current path, navigate for different paths
    if (path === location.pathname) {
      setSearchParams(params);
    } else {
      navigate(`${path}?${params.toString()}`, { replace: false });
    }
  };

  const updateMultipleParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "todos") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    setSearchParams(params);
  };

  const resetAllParams = () => {
    setSearchParams(new URLSearchParams());
  };

  const resetAndSetParam = (key: string, value: string) => {
    const params = new URLSearchParams();
    params.set(key, value);
    setSearchParams(params);
  };

  const resetAllExcept = (keys: string[]) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams();

    keys.forEach((key) => {
      const value = currentParams.get(key);
      if (value !== null) {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  };

  return {
    getParamValue,
    handleSearchParams,
    updateMultipleParams,
    removeParam,
    resetAllParams,
    resetAndSetParam,
    searchParams,
    resetAllExcept,
  };
}