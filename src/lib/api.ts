const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body?: string;
  thumbnail: string | null;
  category: string | null;
  author: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  type: "full-time" | "part-time" | "contract";
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getArticles(): Promise<Article[]> {
  return (await apiGet<Article[]>("/api/articles")) ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return apiGet<Article>(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function getJobs(): Promise<Job[]> {
  return (await apiGet<Job[]>("/api/jobs")) ?? [];
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  return apiGet<Job>(`/api/jobs/${encodeURIComponent(slug)}`);
}
