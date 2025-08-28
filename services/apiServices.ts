// services/apiServices.ts

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  isFileUpload: boolean = false
) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Session expired");
  }

  const headers: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Only set Content-Type for JSON, not for file uploads
  if (!isFileUpload) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.reload();
    throw new Error("Session expired");
  }

  return response;
}
