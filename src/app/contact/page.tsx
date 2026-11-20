import Navbar from "@/components/Navbar";
import Link from "next/link";
import { FaGithub, FaLine, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const contacts = [
  {
    label: "GitHub",
    value: "github.com",
    href: "https://github.com/Phongphat-ohm",
    icon: FaGithub,
  },
  {
    label: "Email",
    value: "Contact me by email",
    href: "mailto:mr.phongphat.p@gmail.com",
    icon: MdEmail,
  },
  {
    label: "Phone",
    value: "Connect on phone",
    href: "tel:0654564610",
    icon: FaPhone,
  },
];

export default function Page() {
  return (
    <>
      <Navbar route_id={4} />
      <main className="site-page">
        <section className="section-shell flex min-h-screen flex-col justify-center pb-16 pt-28 sm:pt-32">
          <div className="max-w-3xl">
            <p className="eyebrow">Contact</p>
            <h1 className="display-title mt-3">
              Let&apos;s build something useful together.
            </h1>
            <p className="body-copy mt-5">
              Reach out for collaboration, portfolio feedback, or software
              development work.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {contacts.map((contact) => {
              const Icon = contact.icon;

              return (
                <Link
                  key={contact.label}
                  href={contact.href}
                  className="apple-card transition hover:-translate-y-1"
                >
                  <div className="p-8">
                    <Icon className="text-3xl" style={{ color: "var(--accent)" }} />
                    <h2 className="mt-5 text-xl font-semibold">{contact.label}</h2>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-tertiary)" }}>{contact.value}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
