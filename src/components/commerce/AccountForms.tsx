"use client";
// MOCK customer account (docs/mock-behaviors.md "Account"): login, register and password-recovery forms with no
// authentication. Submitting only shows a preview notice; nothing is stored or sent, and the password is never read.
// Replace with the custom backend's customer account API in Phase 2.
import Link from "next/link";
import { useState, type FormEvent } from "react";

export type AccountView = "login" | "register" | "recover";

const NOTICE: Record<AccountView, string> = {
  login: "Mode pratinjau: akun pelanggan belum aktif, jadi Anda belum bisa masuk. Anda tetap bisa berbelanja dan checkout tanpa akun.",
  register: "Mode pratinjau: pendaftaran akun belum aktif dan data Anda tidak disimpan. Anda tetap bisa berbelanja dan checkout tanpa akun.",
  recover: "Mode pratinjau: email atur ulang kata sandi belum bisa dikirim.",
};

export default function AccountForms({ initialView }: { initialView: AccountView }) {
  const [view, setView] = useState<AccountView>(initialView);
  const [notice, setNotice] = useState("");

  const show = (next: AccountView) => {
    setView(next);
    setNotice("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(NOTICE[view]);
  };

  return (
    <section className="cm-page mg-account">
      {view === "login" && (
        <>
          <h1>Masuk</h1>
          <form className="mg-account__form" onSubmit={submit}>
            <input className="co-input" name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
            <input className="co-input" name="password" type="password" placeholder="Kata sandi" aria-label="Kata sandi" autoComplete="current-password" required />
            <button type="button" className="cm-link mg-account__forgot" onClick={() => show("recover")}>Lupa kata sandi?</button>
            <button type="submit" className="cm-button cm-button-full">Masuk</button>
          </form>
          <p className="mg-account__alt">Belum punya akun? <button type="button" className="cm-link" onClick={() => show("register")}>Daftar</button></p>
        </>
      )}
      {view === "register" && (
        <>
          <h1>Daftar</h1>
          <form className="mg-account__form" onSubmit={submit}>
            <div className="co-row">
              <input className="co-input" name="firstName" placeholder="Nama depan" aria-label="Nama depan" autoComplete="given-name" required />
              <input className="co-input" name="lastName" placeholder="Nama belakang" aria-label="Nama belakang" autoComplete="family-name" />
            </div>
            <input className="co-input" name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
            <input className="co-input" name="password" type="password" placeholder="Kata sandi (minimal 8 karakter)" aria-label="Kata sandi" autoComplete="new-password" minLength={8} required />
            <button type="submit" className="cm-button cm-button-full">Daftar</button>
          </form>
          <p className="mg-account__alt">Sudah punya akun? <button type="button" className="cm-link" onClick={() => show("login")}>Masuk</button></p>
        </>
      )}
      {view === "recover" && (
        <>
          <h1>Atur Ulang Kata Sandi</h1>
          <p className="mg-account__intro">Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>
          <form className="mg-account__form" onSubmit={submit}>
            <input className="co-input" name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
            <button type="submit" className="cm-button cm-button-full">Kirim</button>
          </form>
          <p className="mg-account__alt"><button type="button" className="cm-link" onClick={() => show("login")}>Kembali ke Masuk</button></p>
        </>
      )}
      <p className="mg-account__notice" role="status">{notice}</p>
      <p className="mg-account__alt mg-account__guest"><Link className="cm-link" href="/collections/new-in">Lanjut belanja tanpa akun</Link></p>
    </section>
  );
}
