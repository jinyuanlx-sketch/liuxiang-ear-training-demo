import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative min-h-[520px] overflow-hidden rounded-lg border border-ivory/10 bg-ink-900">
          <img
            src="/brand/end-card.png"
            alt="流响音乐品牌视觉"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-6">
            <Badge tone="warning">高端音乐升学工作室</Badge>
            <h1 className="mt-4 max-w-lg font-serif text-4xl font-semibold leading-tight text-ivory">
              流响音乐 · 视唱练耳训练系统
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-ivory/80">
              面向艺考学生的专业训练工作台。自动训练提高练习频率，老师诊断保留专业判断。
            </p>
          </div>
        </section>

        <section className="liuxiang-panel flex flex-col justify-center rounded-lg p-6">
          <div>
            <div className="text-sm text-muted">登录</div>
            <h2 className="mt-2 text-2xl font-semibold text-ivory">进入训练系统</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              第一版已预留 Supabase 登录。未配置环境变量时，可使用演示入口查看完整流程。
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
