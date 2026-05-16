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
      <Navbar route_id={3} />
      <main className="min-h-screen bg-base-100 text-base-content">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-primary">Contact</p>
            <h1 className="mt-3 text-4xl font-bold nunito sm:text-6xl">
              Let&apos;s build something useful together.
            </h1>
            <p className="mt-5 text-base leading-8 text-base-content/70">
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
                  className="card bg-base-200 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="card-body">
                    <Icon className="text-3xl text-primary" />
                    <h2 className="card-title">{contact.label}</h2>
                    <p className="text-sm text-base-content/70">{contact.value}</p>
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
