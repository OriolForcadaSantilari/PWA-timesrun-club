"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { SiteFooter } from "@/app/components/site-footer";
import Link from "next/link";

export default function PrivacyPage() {
  const { locale, t } = useT();
  const spanish = locale === "es";

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <SiteHeader />
      <article className="mx-auto flex max-w-xl flex-col gap-8 px-5 py-12 md:px-8">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase">TimesRun Club</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
            {t("privacyTitle")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {spanish ? (
              <>
                En lenguaje claro: qué guardamos y quién lo ve. Preguntas:{" "}
                <a className="underline" href="mailto:hello@timesrun.club">
                  hello@timesrun.club
                </a>
                .
              </>
            ) : (
              <>
                Plain language about what we store and who can see it. Questions:{" "}
                <a className="underline" href="mailto:hello@timesrun.club">
                  hello@timesrun.club
                </a>
                .
              </>
            )}
          </p>
        </div>

        {spanish ? <PrivacyEs /> : <PrivacyEn />}

        <Link href="/find" className="text-[11px] tracking-[0.18em] uppercase underline">
          {t("privacyBack")}
        </Link>
      </article>
      <SiteFooter />
    </div>
  );
}

function PrivacyEn() {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm leading-7 text-white/70">
        TimesRun Club helps people find group runs at public pins in Barcelona. We store the
        account you create: email, name, easy pace, and the gender you choose on your profile.
        We also store the runs you open (time, distance, pace band, who can join, meeting point
        name, and map pin) and which runs you join.
      </p>
      <p className="text-sm leading-7 text-white/70">
        We use this to show the Find board, match your pace, and apply women-only or men-only
        eligibility from the gender you selected. We do not verify identity or gender.
      </p>
      <p className="text-sm leading-7 text-white/70">
        The name you give at sign-up is shown to signed-in members on the same run. Find cards
        show the count and up to three names. People who are not signed in see counts only, never
        names, and never your email. When you join you can choose “Join without showing my name”;
        you still take a spot and appear as “Anonymous runner”. On women-only or men-only runs,
        the name list is shown only to people who have already joined; everyone else sees the
        count. Gender is used only to check eligibility for those restricted runs. It is not
        shown on your public profile. Meeting pins are public places, not private addresses.
      </p>
      <p className="text-sm leading-7 text-white/70">
        The app is hosted on Convex (data and accounts) and Vercel (the website). Clubs listed
        on the Clubs page are public Instagram links we did not collect from you.
      </p>
      <p className="text-sm leading-7 text-white/70">
        To delete your account and data, sign in, open You, and choose Delete my account. That
        removes your profile, your joins, and runs you host. You can also email{" "}
        <a className="underline" href="mailto:hello@timesrun.club">
          hello@timesrun.club
        </a>
        .
      </p>
    </section>
  );
}

function PrivacyEs() {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm leading-7 text-white/70">
        TimesRun Club sirve para encontrar rodajes en grupo en puntos públicos de Barcelona.
        Guardamos la cuenta que creas: email, nombre, ritmo fácil y el género que eliges en tu
        perfil. También guardamos los rodajes que abres (hora, distancia, rango de ritmo, quién
        puede unirse, nombre del punto y pin en el mapa) y a cuáles te unes.
      </p>
      <p className="text-sm leading-7 text-white/70">
        Lo usamos para mostrar el tablero Find, encajar tu ritmo y aplicar rodajes solo mujeres
        o solo hombres según el género que hayas elegido. No verificamos identidad ni género.
      </p>
      <p className="text-sm leading-7 text-white/70">
        El nombre que das al crear la cuenta lo ven las personas con sesión iniciada en el
        mismo rodaje. En Find se ve el recuento y hasta tres nombres. Quien no ha iniciado
        sesión solo ve recuentos, nunca nombres ni el email. Al unirte puedes elegir “Unirme
        sin mostrar mi nombre”: ocupas plaza y apareces como “Anonymous runner”. En rodajes
        solo mujeres o solo hombres, la lista de nombres solo la ven quienes ya se han unido;
        el resto ve el recuento. El género solo se usa para esa elegibilidad. No aparece en un
        perfil público. Los pines son lugares públicos, no direcciones privadas.
      </p>
      <p className="text-sm leading-7 text-white/70">
        La app está alojada en Convex (datos y cuentas) y Vercel (la web). Los clubs de la
        página Clubs son enlaces públicos de Instagram.
      </p>
      <p className="text-sm leading-7 text-white/70">
        Para borrar tu cuenta y tus datos, entra, ve a You y elige Eliminar mi cuenta. Eso
        elimina tu perfil, tus apuntados y los rodajes que organizas. También puedes escribir a{" "}
        <a className="underline" href="mailto:hello@timesrun.club">
          hello@timesrun.club
        </a>
        .
      </p>
    </section>
  );
}
