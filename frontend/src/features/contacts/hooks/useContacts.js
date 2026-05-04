import { useState, useEffect, useCallback } from "react";
import contactService from "../services/contactService";

/**
 * Hook to manage contact lists state and operations.
 */
export function useContactLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactService.getContactLists();
      setLists(response.data.contactLists || []);
    } catch (err) {
      setLists([]);
      setError(err.message || "Failed to fetch contact lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    loading,
    error,
    refresh: fetchLists,
  };
}

/**
 * Hook to manage a single contact list and its leads.
 */
export function useContactList(listId) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await contactService.getContactListById(listId);
      setList(response.data.contactList || null);
    } catch (err) {
      setList(null);
      setError(err.message || "Failed to fetch contact list");
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    list,
    loading,
    error,
    refresh: fetchList,
  };
}
