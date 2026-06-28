import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("article", "routes/article.tsx"),
    route("generation", "routes/generation.tsx"),
    route("about", "routes/about.tsx"),
    route("feedback", "routes/feedback.tsx"),
    route("login", "routes/login.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("register", "routes/register.tsx"),
    route("article/:id", "routes/article.$id.tsx"),
    route("key", "routes/key.tsx"),
] satisfies RouteConfig;
