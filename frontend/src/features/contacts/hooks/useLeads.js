import { useState, useEffect, useCallback } from "react";
import leadService from "../services/leadService";

/**
 * Hook to manage leads state and operations for a specific contact list.
 */
export function useLeads(listId, initialParams = {}) {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 25,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialParams,
  });

  const fetchLeads = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(listId, params);
      setLeads(response.data.leads || []);
      setPagination(
        response.data.pagination || {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (err) {
      setLeads([]);
      setPagination({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
      });
      setError(err.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [listId, params]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateParams = (newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page || prev.page,
    }));
  };

  const changePage = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    leads,
    pagination,
    loading,
    error,
    params,
    updateParams,
    changePage,
    refresh: fetchLeads,
  };
}
