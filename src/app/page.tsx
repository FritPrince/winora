import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl p-3"
          style={{ background: "#0d1b2e" }}
        >
          <Image
            src="/winora-mark.png"
            alt="Winora"
            width={40}
            height={40}
            priority
          />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">
          Bientôt disponible
        </p>

        <h1 className="mb-4 text-3xl leading-tight font-normal text-balance text-foreground sm:text-4xl font-serif">
          Une boutique premium de produits digitaux, pensée pour l&apos;Afrique
        </h1>

        <p className="text-base leading-relaxed text-foreground-muted">
          Winora prépare son lancement. Catalogue sélectionné, paiement mobile
          money, et une expérience pensée comme une maison plutôt qu&apos;un
          supermarché.
        </p>

        <div
          className="my-10 h-px w-16"
          style={{ background: "var(--gold)" }}
        />

        <p className="text-sm text-foreground-muted">
          &copy; {new Date().getFullYear()} Winora. Tous droits réservés.
        </p>
      </div>
    </main>
  );
}
