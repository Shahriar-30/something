/**
 * Base API client configuration.
 * Using fetch for simplicity, but can be replaced with Axios if needed.
 */
export const apiClient = async (endpoint, options = {}) => {
  const { body, ...customConfig } = options;
  const headers = { 'Content-Type': 'application/json', ...customConfig.headers };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    throw new Error(data.message || 'Something went wrong');
  } catch (error) {
    return Promise.reject(error.message || error);
  }
};
