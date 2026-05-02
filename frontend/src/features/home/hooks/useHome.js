import { useState, useEffect } from "react";
import { getGreeting } from "../services/homeService";

export const useHome = () => {
  const [hello, setHello] = useState(null);
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    getGreeting()
      .then((data) => {
        if (!cancelled) {
          setHello(
            data?.data?.greeting ?? data?.message ?? JSON.stringify(data)
          );
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErr("Could not reach API (is the backend on :8080?)");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { hello, err, isLoading };
};
