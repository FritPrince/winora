import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl p-3"
            style={{ background: "#0d1b2e" }}
          >
            <Image src="/winora-mark.png" alt="Winora" width={36} height={36} />
          </div>
        </Link>
        {children}
      </div>
    </main>
  );
}
