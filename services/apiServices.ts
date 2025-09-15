// ✅ Unified API service with JWT handling

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

// ✅ Auth APIs
export async function login(email: string, password: string) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");

  localStorage.setItem("authToken", data.token);
  return data;
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Registration failed");

  localStorage.setItem("authToken", data.token);
  return data;
}

// ✅ Posts APIs
export async function fetchPosts(limit = 10, page = 1) {
  const response = await fetch(`/api/posts?limit=${limit}&page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function createPost(content: string, mediaUrl?: string, mediaType?: string) {
  const response = await fetchWithAuth("/api/posts", {
    method: "POST",
    body: JSON.stringify({ content, mediaUrl, mediaType }),
  });
  return response.json();
}

export async function updatePost(id: number, content: string) {
  const response = await fetchWithAuth("/api/posts", {
    method: "PUT",
    body: JSON.stringify({ id, content }),
  });
  return response.json();
}

export async function deletePost(id: number) {
  const response = await fetchWithAuth(`/api/posts?id=${id}`, {
    method: "DELETE",
  });
  return response.json();
}

// ✅ Partner Requests APIs
export async function fetchPartnerRequests() {
  const response = await fetchWithAuth("/api/partner-requests");
  if (!response.ok) throw new Error("Failed to fetch partner requests");
  return response.json();
}

export async function sendPartnerRequest(senderId: number, recipientId: number, tripDescription: string, imageUrl?: string) {
  const response = await fetchWithAuth("/api/partner-requests", {
    method: "POST",
    body: JSON.stringify({ senderId, recipientId, tripDescription, imageUrl }),
  });
  return response.json();
}

export async function respondToPartnerRequest(requestId: number, action: "accept" | "reject") {
  const response = await fetchWithAuth("/api/partner-requests", {
    method: "POST",
    body: JSON.stringify({ requestId, action }),
  });
  return response.json();
}

// ✅ Users APIs
export async function fetchUsers() {
  const response = await fetchWithAuth("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function updateAvatar(avatarUrl: string) {
  const response = await fetchWithAuth("/api/users", {
    method: "PUT",
    body: JSON.stringify({ avatarUrl }),
  });
  return response.json();
}
