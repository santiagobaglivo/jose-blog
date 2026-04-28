import { getDashboardStats, getPublishedPosts } from "@/lib/queries/posts";
import { getAllCommentsAdmin } from "@/lib/queries/comments";
import {
  FileText,
  MessageSquare,
  MessagesSquare,
  Users,
  TrendingUp,
  CalendarClock,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const [dashboardStats, allComments, published] = await Promise.all([
    getDashboardStats(),
    getAllCommentsAdmin(),
    getPublishedPosts(),
  ]);

  const statCards = [
    {
      label: "Artículos publicados",
      value: dashboardStats.publishedPosts,
      icon: FileText,
      href: "/admin/articulos",
    },
    {
      label: "Comentarios pendientes",
      value: dashboardStats.pendingComments,
      icon: MessageSquare,
      href: "/admin/comentarios",
      alert: true,
    },
    {
      label: "Hilos en foros",
      value: dashboardStats.totalThreads,
      icon: MessagesSquare,
      href: "/admin/foros",
    },
    {
      label: "Usuarios registrados",
      value: dashboardStats.totalUsers,
      icon: Users,
      href: "/admin/usuarios",
    },
    {
      label: "Visitas del mes",
      value: dashboardStats.monthlyViews.toLocaleString(),
      icon: Eye,
      trend: dashboardStats.viewsTrend,
    },
    {
      label: "Publicaciones programadas",
      value: dashboardStats.scheduledPosts,
      icon: CalendarClock,
      href: "/admin/programados",
    },
  ];

  const recentComments = allComments.filter((c) => c.status === "pendiente");
  const recentPosts = published.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-[0.875rem] text-muted-foreground">
          Resumen general de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {statCards.map((stat) => {
          const cardContent = (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.75rem] font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground font-serif">
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span className="text-[0.75rem] font-medium text-green-600 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  stat.alert
                    ? "bg-orange-50 text-orange-500"
                    : "bg-secondary/80 text-muted-foreground"
                }`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          );
          const cls =
            "group bg-card border border-border/50 rounded-xl p-5 hover:border-border hover:shadow-sm transition-all duration-300";
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={cls}>
              {cardContent}
            </Link>
          ) : (
            <div key={stat.label} className={cls}>
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending comments */}
        <div className="bg-card border border-border/50 rounded-xl">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground font-sans flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Comentarios pendientes
            </h2>
            <Link
              href="/admin/comentarios"
              className="text-[0.75rem] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <div key={comment.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[0.8125rem] font-medium text-foreground">
                      {comment.author}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[0.6875rem] text-orange-600 border-orange-200"
                    >
                      Pendiente
                    </Badge>
                  </div>
                  <p className="text-[0.8125rem] text-muted-foreground line-clamp-2">
                    {comment.content}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] text-muted-foreground/60">{comment.date}</p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-[0.8125rem] text-muted-foreground/60">
                No hay comentarios pendientes.
              </div>
            )}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-card border border-border/50 rounded-xl">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground font-sans">
              Últimos artículos publicados
            </h2>
            <Link
              href="/admin/articulos"
              className="text-[0.75rem] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentPosts.map((post) => (
              <div key={post.slug} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.8125rem] font-medium text-foreground truncate">
                    {post.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[0.75rem] text-muted-foreground/60">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[0.6875rem] shrink-0">
                  {post.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
