import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Persistence store file in /tmp on Vercel / serverless runtime
const TMP_DB_FILE = path.join(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp" : process.cwd(),
  ".qreet_cms_data.json"
);

function loadPersistentData(): { pages?: any[]; posts?: any[]; users?: any[] } {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const content = fs.readFileSync(TMP_DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading persistent store:", err);
  }
  return {};
}

function savePersistentData(data: { pages?: any[]; posts?: any[]; users?: any[] }) {
  try {
    const existing = loadPersistentData();
    const merged = { ...existing, ...data };
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(merged), "utf-8");
  } catch (err) {
    console.error("Error writing persistent store:", err);
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const realPrisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = realPrisma;

const MOCK_USERS: any[] = [
  {
    id: "admin-1",
    email: "admin@qreet.com",
    name: "Erfan",
    passwordHash: "$2a$10$w8T9uD2rD1f8Z3h9Q0e4OeY2yVzG7Qe5W4Z9b8u0p8i7y6t5r4e3w",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEFAULT_AUTHORS = [
  {
    id: "author-1",
    name: "Erfan Darroudi",
    slug: "erfan",
    bio: "Senior Full-Stack Developer & Software Architect",
    avatar: null,
    _count: { posts: 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEFAULT_CATEGORIES = [
  {
    id: "cat-1",
    name: "Tech & Software",
    slug: "tech",
    description: "Modern software architecture, Next.js, and cloud systems",
    seoTitle: "Tech & Software",
    seoDescription: null,
    canonicalUrl: null,
    robotsIndex: true,
    robotsFollow: true,
    _count: { posts: 2 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat-2",
    name: "Design & UX",
    slug: "design",
    description: "Modern web interfaces, user experience, and animations",
    seoTitle: "Design & UX",
    seoDescription: null,
    canonicalUrl: null,
    robotsIndex: true,
    robotsFollow: true,
    _count: { posts: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEFAULT_PAGES: any[] = [
  {
    id: "page-1",
    title: "Home",
    slug: "home",
    image: null,
    html: "<h1>Welcome to Qreet CMS</h1><p>High-performance headless CMS and digital content platform.</p>",
    css: "h1 { color: #a855f7; font-weight: bold; }",
    status: "PUBLISHED" as const,
    seoTitle: "Home · Qreet",
    seoDescription: "Official homepage of Qreet CMS platform.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "page-2",
    title: "About Us",
    slug: "about",
    image: null,
    html: "<h1>About Qreet</h1><p>Scalable cloud solutions engineered for performance.</p>",
    css: "",
    status: "PUBLISHED" as const,
    seoTitle: "About Us · Qreet",
    seoDescription: "Learn more about our vision and platform.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "page-3",
    title: "Contact",
    slug: "contact",
    image: null,
    html: "<h1>Contact Us</h1><p>Reach out to our engineering and support team.</p>",
    css: "",
    status: "DRAFT" as const,
    seoTitle: "Contact · Qreet",
    seoDescription: "Get in touch with Qreet specialists.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEFAULT_POSTS: any[] = [
  {
    id: "post-1",
    title: "Modern Cloud Deployments and Vercel Architecture",
    slug: "cloud-services-deployment",
    excerpt: "Exploring modern Jamstack and serverless hosting on Vercel.",
    content: "<p>Deep dive into edge functions and serverless scaling.</p>",
    featuredImage: null,
    featuredImageAlt: null,
    status: "PUBLISHED" as const,
    authorId: "author-1",
    author: { id: "author-1", name: "Erfan Darroudi", slug: "erfan" },
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Tech & Software", slug: "tech" },
    seoTitle: "Modern Cloud Deployments",
    seoDescription: "Guide to deploying modern web applications.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "post-2",
    title: "Next.js 14 Performance & SEO Mastery",
    slug: "nextjs-seo-optimization",
    excerpt: "Optimizing Core Web Vitals, SSR caching, and metadata generation.",
    content: "<p>Techniques for achieving 100/100 Lighthouse performance.</p>",
    featuredImage: null,
    featuredImageAlt: null,
    status: "PUBLISHED" as const,
    authorId: "author-1",
    author: { id: "author-1", name: "Erfan Darroudi", slug: "erfan" },
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Tech & Software", slug: "tech" },
    seoTitle: "Next.js 14 Performance & SEO",
    seoDescription: "Comprehensive performance tuning for Next.js App Router.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "post-3",
    title: "Modular Headless Architecture & Content Systems",
    slug: "modular-architecture-cms",
    excerpt: "Designing resilient content pipelines with decoupled backends.",
    content: "<p>Headless CMS architecture patterns for high-scale digital brands.</p>",
    featuredImage: null,
    featuredImageAlt: null,
    status: "DRAFT" as const,
    authorId: "author-1",
    author: { id: "author-1", name: "Erfan Darroudi", slug: "erfan" },
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Design & UX", slug: "design" },
    seoTitle: "Modular Architecture Guide",
    seoDescription: "Decoupled CMS architectures and structured API modeling.",
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    robotsIndex: true,
    robotsFollow: true,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_MEDIA = [
  {
    id: "media-1",
    filename: "qreet-dashboard-preview.webp",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
    mimeType: "image/webp",
    alt: "Admin dashboard overview preview",
    width: 1200,
    height: 630,
    size: 78500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "media-2",
    filename: "cloud-infrastructure.png",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
    mimeType: "image/png",
    alt: "Cloud servers and infrastructure network",
    width: 1200,
    height: 800,
    size: 134000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_SETTING = {
  id: 1,
  siteName: "Qreet CMS",
  logo: null,
  defaultSeoTitle: "Qreet CMS — Advanced Content Platform",
  defaultSeoDescription: "Unified content management platform and headless web services",
  analyticsId: null,
  clarityId: null,
  headerHtml: "",
  headerCss: "",
  footerHtml: "",
  footerCss: "",
  socialLinks: { twitter: "https://twitter.com", linkedin: "https://linkedin.com" },
  updatedAt: new Date(),
};

function getFallback(model: string, action: string, args: unknown[]) {
  const params = (args[0] ?? {}) as Record<string, unknown>;

  if (model === "page") {
    const store = loadPersistentData();
    const currentPages = store.pages || DEFAULT_PAGES;

    if (action === "count") {
      const where = (params.where ?? {}) as { status?: string };
      return where.status === "PUBLISHED"
        ? currentPages.filter((p: any) => p.status === "PUBLISHED").length
        : currentPages.length;
    }
    if (action === "findMany") return currentPages;
    if (action === "findUnique" || action === "findFirst") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      // 1. Exact ID match
      if (where.id) {
        const byId = currentPages.find((p: any) => p.id === where.id || String(p.id).toLowerCase() === String(where.id).toLowerCase());
        if (byId) return byId;
      }
      // 2. Exact or decoded Slug match
      if (where.slug) {
        const decoded = decodeURIComponent(where.slug);
        const stripHtml = where.slug.replace(/\.html?$/i, "");
        const stripDecoded = decoded.replace(/\.html?$/i, "");
        const bySlug = currentPages.find(
          (p: any) =>
            p.slug === where.slug ||
            p.slug === decoded ||
            decodeURIComponent(p.slug) === decoded ||
            p.slug === stripHtml ||
            p.slug === stripDecoded ||
            p.slug.replace(/\.html?$/i, "") === stripDecoded
        );
        if (bySlug) return bySlug;
      }
      // 3. Fallback: check if id contains or is contained in stored id
      if (where.id) {
        const partial = currentPages.find(
          (p: any) => String(p.id).includes(where.id!) || where.id!.includes(String(p.id))
        );
        if (partial) return partial;
      }
      return null;
    }
    if (action === "create" || action === "update") {
      const data = params.data as Record<string, unknown>;
      const existingIdx = data.slug
        ? currentPages.findIndex((p: any) => p.slug === data.slug)
        : (data.id ? currentPages.findIndex((p: any) => p.id === data.id) : -1);
      const newPage = {
        id: (data.id as string) || `page-${Date.now()}`,
        title: (data.title as string) || "Untitled Page",
        slug: (data.slug as string) || `page-${Date.now()}`,
        image: (data.image as string) ?? null,
        html: (data.html as string) || "",
        css: (data.css as string) || "",
        status: (data.status as any) || "DRAFT",
        seoTitle: (data.seoTitle as string) ?? null,
        seoDescription: (data.seoDescription as string) ?? null,
        canonicalUrl: (data.canonicalUrl as string) ?? null,
        ogTitle: (data.ogTitle as string) ?? null,
        ogDescription: (data.ogDescription as string) ?? null,
        ogImage: (data.ogImage as string) ?? null,
        robotsIndex: typeof data.robotsIndex === "boolean" ? data.robotsIndex : true,
        robotsFollow: typeof data.robotsFollow === "boolean" ? data.robotsFollow : true,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedList = [...currentPages];
      if (existingIdx >= 0) {
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...newPage };
        savePersistentData({ pages: updatedList });
        return updatedList[existingIdx];
      } else {
        updatedList.unshift(newPage);
        savePersistentData({ pages: updatedList });
        return newPage;
      }
    }
    if (action === "delete") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      const idx = currentPages.findIndex((p: any) => (where.id && p.id === where.id) || (where.slug && p.slug === where.slug));
      if (idx >= 0) {
        const updatedList = [...currentPages];
        const removed = updatedList.splice(idx, 1)[0];
        savePersistentData({ pages: updatedList });
        return removed;
      }
      return currentPages[0];
    }
  }

  if (model === "post") {
    const store = loadPersistentData();
    const currentPosts = store.posts || DEFAULT_POSTS;

    if (action === "count") {
      const where = (params.where ?? {}) as { status?: string };
      return where.status === "PUBLISHED"
        ? currentPosts.filter((p: any) => p.status === "PUBLISHED").length
        : currentPosts.length;
    }
    if (action === "findMany") {
      const take = params.take as number | undefined;
      return typeof take === "number" ? currentPosts.slice(0, take) : currentPosts;
    }
    if (action === "findUnique" || action === "findFirst") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      const found = currentPosts.find((p: any) => (where.id && p.id === where.id) || (where.slug && p.slug === where.slug));
      return found ?? null;
    }
    if (action === "create" || action === "update") {
      const data = params.data as Record<string, unknown>;
      const existingIdx = data.slug ? currentPosts.findIndex((p: any) => p.slug === data.slug) : (data.id ? currentPosts.findIndex((p: any) => p.id === data.id) : -1);
      const newPost = {
        id: (data.id as string) || `post-${Date.now()}`,
        title: (data.title as string) || "Untitled Post",
        slug: (data.slug as string) || `post-${Date.now()}`,
        excerpt: (data.excerpt as string) || "",
        content: (data.content as string) || "",
        featuredImage: (data.featuredImage as string) ?? null,
        featuredImageAlt: (data.featuredImageAlt as string) ?? null,
        status: (data.status as any) || "DRAFT",
        authorId: "author-1",
        author: { id: "author-1", name: "Erfan Darroudi", slug: "erfan" },
        categoryId: (data.categoryId as string) || "cat-1",
        category: { id: "cat-1", name: "Tech & Software", slug: "tech" },
        seoTitle: (data.seoTitle as string) ?? null,
        seoDescription: (data.seoDescription as string) ?? null,
        canonicalUrl: (data.canonicalUrl as string) ?? null,
        ogTitle: (data.ogTitle as string) ?? null,
        ogDescription: (data.ogDescription as string) ?? null,
        ogImage: (data.ogImage as string) ?? null,
        robotsIndex: typeof data.robotsIndex === "boolean" ? data.robotsIndex : true,
        robotsFollow: typeof data.robotsFollow === "boolean" ? data.robotsFollow : true,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedList = [...currentPosts];
      if (existingIdx >= 0) {
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...newPost };
        savePersistentData({ posts: updatedList });
        return updatedList[existingIdx];
      } else {
        updatedList.unshift(newPost);
        savePersistentData({ posts: updatedList });
        return newPost;
      }
    }
    if (action === "delete") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      const idx = currentPosts.findIndex((p: any) => (where.id && p.id === where.id) || (where.slug && p.slug === where.slug));
      if (idx >= 0) {
        const updatedList = [...currentPosts];
        const removed = updatedList.splice(idx, 1)[0];
        savePersistentData({ posts: updatedList });
        return removed;
      }
      return currentPosts[0];
    }
  }

  if (model === "category") {
    if (action === "findMany") return DEFAULT_CATEGORIES;
    if (action === "findUnique" || action === "findFirst") return DEFAULT_CATEGORIES[0];
    if (action === "create" || action === "update") return { ...DEFAULT_CATEGORIES[0], ...(params.data as object) };
    if (action === "delete") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      const idx = DEFAULT_CATEGORIES.findIndex((c) => (where.id && c.id === where.id) || (where.slug && c.slug === where.slug));
      if (idx >= 0) {
        return DEFAULT_CATEGORIES.splice(idx, 1)[0];
      }
      return DEFAULT_CATEGORIES[0];
    }
  }

  if (model === "author") {
    if (action === "findMany") return DEFAULT_AUTHORS;
    if (action === "findUnique" || action === "findFirst") return DEFAULT_AUTHORS[0];
    if (action === "create" || action === "update") return { ...DEFAULT_AUTHORS[0], ...(params.data as object) };
    if (action === "delete") {
      const where = (params.where ?? {}) as { id?: string; slug?: string };
      const idx = DEFAULT_AUTHORS.findIndex((a) => (where.id && a.id === where.id) || (where.slug && a.slug === where.slug));
      if (idx >= 0) {
        return DEFAULT_AUTHORS.splice(idx, 1)[0];
      }
      return DEFAULT_AUTHORS[0];
    }
  }

  if (model === "media") {
    if (action === "count") return MOCK_MEDIA.length;
    if (action === "findMany") return MOCK_MEDIA;
    if (action === "findUnique" || action === "findFirst") return MOCK_MEDIA[0];
    if (action === "create") return { ...MOCK_MEDIA[0], ...(params.data as object) };
    if (action === "delete") return MOCK_MEDIA[0];
  }

  if (model === "setting") {
    if (action === "findUnique" || action === "findFirst") return MOCK_SETTING;
    if (action === "update" || action === "upsert") return { ...MOCK_SETTING, ...(params.data as object) };
  }

  if (model === "redirect") {
    if (action === "findMany") return [];
    if (action === "findUnique" || action === "findFirst") return null;
  }

  if (model === "user") {
    if (action === "findMany") {
      return [...MOCK_USERS];
    }
    if (action === "count") {
      return MOCK_USERS.length;
    }
    if (action === "findUnique" || action === "findFirst") {
      const where = (params.where ?? {}) as { id?: string; email?: string };
      const found = MOCK_USERS.find((u) => (where.id && u.id === where.id) || (where.email && u.email.toLowerCase() === where.email.toLowerCase()));
      return found ?? null;
    }
    if (action === "create" || action === "update") {
      const data = params.data as any;
      const u = {
        id: data?.id || `user-${Date.now()}`,
        email: data?.email || "user@qreet.com",
        name: data?.name || "User",
        passwordHash: data?.passwordHash || "",
        role: data?.role || "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const existingIdx = MOCK_USERS.findIndex((x) => x.email.toLowerCase() === u.email.toLowerCase());
      if (existingIdx >= 0) {
        MOCK_USERS[existingIdx] = { ...MOCK_USERS[existingIdx], ...u };
        return MOCK_USERS[existingIdx];
      }
      MOCK_USERS.push(u);
      return u;
    }
    if (action === "delete") {
      const where = (params.where ?? {}) as { id?: string; email?: string };
      const idx = MOCK_USERS.findIndex((u) => (where.id && u.id === where.id) || (where.email && u.email.toLowerCase() === where.email.toLowerCase()));
      if (idx >= 0) {
        const deleted = MOCK_USERS.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    }
  }

  return null;
}

function createModelProxy(modelName: string, modelTarget: unknown) {
  return new Proxy(modelTarget as object, {
    get(target, actionProp) {
      const orig = (target as Record<string, unknown>)[actionProp as string];
      if (typeof orig === "function") {
        return async (...args: unknown[]) => {
          try {
            return await (orig as (...a: unknown[]) => Promise<unknown>).apply(target, args);
          } catch (err) {
            console.warn(`[Prisma offline fallback] model=${modelName}.${String(actionProp)}`);
            return getFallback(modelName, String(actionProp), args);
          }
        };
      }
      return orig;
    },
  });
}

export const prisma = new Proxy(realPrisma as unknown as object, {
  get(target, prop) {
    const orig = (target as Record<string, unknown>)[prop as string];
    if (
      typeof prop === "string" &&
      [
        "page",
        "post",
        "category",
        "author",
        "media",
        "setting",
        "redirect",
        "user",
      ].includes(prop)
    ) {
      return createModelProxy(prop, orig ?? {});
    }
    return orig;
  },
}) as unknown as PrismaClient;
