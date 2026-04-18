"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const eventDate = new Date("2026-05-24T08:00:00+07:00");
const accountNumber = "0083 0115 4822 500";

const sections = [
  { href: "#peta", label: "Lokasi" },
  { href: "#acara", label: "Acara" },
  { href: "#gift", label: "Gift" },
];

const couple = [
  {
    role: "Mempelai Wanita",
    name: "Roudlotul Jannah",
    child: "Putri dari",
    parents: "Bapak Abdul Rozak & Ibu Siti Fatonah (Almh)",
  },
  {
    role: "Mempelai Pria",
    name: "Muhammad Ilham Rifa'i",
    child: "Putra dari",
    parents: "Bapak Muhidin & Ibu Kuswatiningsih",
  },
];

type AudioBundle = {
  context: AudioContext;
  gain: GainNode;
  oscillators: OscillatorNode[];
  melodyTimer: number;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

function getTimeLeft(): TimeLeft {
  const difference = Math.max(eventDate.getTime() - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function formatTwoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const audioRef = useRef<AudioBundle | null>(null);

  const countdownItems = useMemo(
    () => [
      { label: "Hari", value: timeLeft.days.toString() },
      { label: "Jam", value: formatTwoDigits(timeLeft.hours) },
      { label: "Menit", value: formatTwoDigits(timeLeft.minutes) },
      { label: "Detik", value: formatTwoDigits(timeLeft.seconds) },
    ],
    [timeLeft],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current?.melodyTimer) {
        window.clearInterval(audioRef.current.melodyTimer);
      }

      audioRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
      audioRef.current?.context.close();
      audioRef.current = null;
    };
  }, []);

  function createAmbientMusic() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass || audioRef.current) {
      return audioRef.current;
    }

    const context = new AudioContextClass();
    const gain = context.createGain();
    const notes = [196, 246.94, 329.63, 392];
    const oscillators = notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const noteGain = context.createGain();

      oscillator.type = index === 3 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      filter.type = "lowpass";
      filter.frequency.value = index === 3 ? 1200 : 760;
      noteGain.gain.value = index === 3 ? 0.12 : 0.07;

      oscillator.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(gain);
      oscillator.start();

      return oscillator;
    });
    const melody = [392, 440, 493.88, 587.33, 493.88, 440];
    let step = 0;
    const melodyTimer = window.setInterval(() => {
      const lead = oscillators[3];

      lead.frequency.setTargetAtTime(
        melody[step % melody.length],
        context.currentTime,
        0.12,
      );
      step += 1;
    }, 1250);

    gain.gain.value = 0;
    gain.connect(context.destination);
    audioRef.current = { context, gain, oscillators, melodyTimer };

    return audioRef.current;
  }

  async function playMusic() {
    const audio = createAmbientMusic();

    if (!audio) {
      return;
    }

    if (audio.context.state === "suspended") {
      await audio.context.resume();
    }

    audio.gain.gain.cancelScheduledValues(audio.context.currentTime);
    audio.gain.gain.linearRampToValueAtTime(0.18, audio.context.currentTime + 0.8);
    setIsMusicPlaying(true);
  }

  function pauseMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.gain.gain.cancelScheduledValues(audio.context.currentTime);
    audio.gain.gain.linearRampToValueAtTime(0, audio.context.currentTime + 0.4);
    setIsMusicPlaying(false);
  }

  async function openInvitation() {
    setIsOpened(true);
    await playMusic();

    window.setTimeout(() => {
      document.getElementById("undangan")?.scrollIntoView({ behavior: "smooth" });
    }, 260);
  }

  async function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
      return;
    }

    await playMusic();
  }

  async function copyAccountNumber() {
    await navigator.clipboard.writeText(accountNumber.replaceAll(" ", ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <section className={`cover ${isOpened ? "cover-opened" : ""}`}>
        <div className="watercolor watercolor-top" />
        <div className="gold-dust dust-one" />
        <div className="gold-dust dust-two" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 text-center md:px-8">
          <p className="cover-eyebrow eyebrow">The Wedding Of</p>
          <h1 className="cover-title script-title mt-5 text-white">
            Roudlotul
            <span className="block text-[0.58em] text-[var(--gold-soft)]">&</span>
            Ilham
          </h1>
          <div className="mt-8 h-px w-44 bg-gradient-to-r from-transparent via-[var(--gold-soft)] to-transparent" />
          <p className="mt-6 text-base tracking-[0.18em] text-white/90 sm:text-lg">
            MINGGU LEGI, 24 MEI 2026
          </p>
          <button className="primary-button mt-10" type="button" onClick={openInvitation}>
            Buka Undangan
          </button>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Musik akan mulai setelah undangan dibuka.
          </p>
        </div>
      </section>

      <div id="undangan" className="relative">
        <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-[var(--background)]/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <a className="script-title text-2xl text-[var(--navy-dark)] md:text-3xl" href="#home">
              R & I
            </a>
            <div className="no-scrollbar flex flex-1 justify-end gap-2 overflow-x-auto sm:gap-3 md:gap-4 md:overflow-visible">
              {sections.map((section) => (
                <a 
                  className="whitespace-nowrap rounded-md border border-[var(--navy-dark)]/10 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-[var(--navy-dark)] transition-colors hover:bg-white/90 md:text-sm" 
                  href={section.href} 
                  key={section.label}
                  target={section.target}
                  rel={section.target === "_blank" ? "noreferrer" : undefined}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <section id="home" className="relative overflow-hidden">
          <div className="absolute pointer-events-none top-band" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-20">
            <div className="relative z-10 text-center lg:text-left">
              <p className="eyebrow text-[var(--gold)]">Undangan Pernikahan</p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] text-[var(--navy-dark)] sm:text-5xl lg:text-[4.65rem] lg:leading-[1.08]">
                Roudlotul Jannah
                <span className="script-ampersand block py-2 text-[var(--gold)]">&</span>
                Muhammad Ilham Rifa&apos;i
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8 lg:mx-0">
                Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
                Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada
                hari bahagia kami.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <a className="primary-button inline-flex w-full justify-center sm:w-auto" href="#acara">
                  Lihat Detail Acara
                </a>
                <a className="secondary-button inline-flex w-full justify-center sm:w-auto" href="#gift">
                  Kirim Tanda Kasih
                </a>
              </div>
            </div>

            <div className="invitation-card mx-auto w-full max-w-md">
              <p className="text-xs font-semibold tracking-[0.32em] text-[var(--gold)] uppercase sm:text-sm">Akad & Resepsi</p>
              <p className="mt-6 text-6xl font-semibold text-[var(--navy-dark)] sm:mt-8 sm:text-7xl">24</p>
              <p className="mt-2 text-xl font-medium text-[var(--navy)] sm:text-2xl">Mei 2026</p>
              <div className="my-6 h-px w-full bg-[var(--line)] sm:my-8" />
              <p className="text-base font-medium text-[var(--foreground)] sm:text-lg">Minggu Legi</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:mt-3 sm:text-base sm:leading-7">
                Tegalrejo RT 04/RW 01, Sugihmanik, Tanggungharjo
              </p>
            </div>
          </div>
        </section>

        <section id="mempelai" className="section px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <p className="eyebrow text-[var(--gold)]">Mempelai</p>
              <h2>Kedua Mempelai</h2>
              <p>
                Dua keluarga bertemu dalam doa yang sama, merayakan awal
                perjalanan baru dengan penuh syukur.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {couple.map((person) => (
                <article className="person-card" key={person.name}>
                  <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold)]">
                    {person.role}
                  </p>
                  <h3>{person.name}</h3>
                  <p className="mt-5 text-sm text-[var(--muted)]">{person.child}</p>
                  <p className="mt-2 text-lg leading-8 text-[var(--navy-dark)]">
                    {person.parents}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="acara" className="section event-section px-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <p className="eyebrow text-[var(--gold)]">Save The Date</p>
              <h2>Detail Acara</h2>
              <p>
                Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i
                berkenan hadir dan memberikan doa restu.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="event-panel">
                <span>Akad & Resepsi</span>
                <h3>Minggu Legi, 24 Mei 2026</h3>
                <p>Tegalrejo RT 04/RW 01, Sugihmanik, Tanggungharjo</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    className="primary-button inline-flex justify-center"
                    href="https://www.google.com/maps/search/?api=1&query=-7.093457,110.610134"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Buka Lokasi
                  </a>
                  <a
                    className="secondary-button inline-flex justify-center"
                    href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Akad%20%26%20Resepsi%20Roudlotul%20dan%20Ilham&dates=20260524T010000Z/20260524T060000Z&details=Undangan%20pernikahan%20Roudlotul%20Jannah%20dan%20Muhammad%20Ilham%20Rifai&location=Tegalrejo%20RT%2004%2FRW%2001%2C%20Sugihmanik%2C%20Tanggungharjo"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Simpan Tanggal
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                {countdownItems.map((item) => (
                  <div className="countdown-item flex min-h-[7.5rem] flex-col items-center justify-center rounded-lg border border-[var(--gold-soft)]/40 bg-gradient-to-br from-[var(--navy-dark)]/95 to-[var(--navy)]/90 text-white shadow-sm sm:min-h-[8.25rem]" key={item.label}>
                    <strong suppressHydrationWarning className="text-3xl font-bold leading-none sm:text-4xl lg:text-[3.7rem]">{item.value}</strong>
                    <span suppressHydrationWarning className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/80 sm:mt-3 sm:text-[0.82rem]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="gift" className="section gift-section px-4 md:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow text-[var(--gold)]">Love Gift</p>
              <h2 className="mt-4 text-3xl font-semibold text-[var(--navy-dark)] sm:text-4xl lg:text-5xl">
                Tanda Kasih
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
                Tanpa mengurangi rasa hormat, bagi yang ingin memberikan tanda
                kasih dapat mengirimkannya melalui rekening berikut.
              </p>
            </div>

            <div className="bank-card mx-auto w-full max-w-md">
              <span>Bank BRI</span>
              <strong>{accountNumber}</strong>
              <p>Nomor rekening</p>
              <button className="primary-button mt-7 w-full" type="button" onClick={copyAccountNumber}>
                {copied ? "Nomor Tersalin" : "Salin Nomor Rekening"}
              </button>
            </div>
          </div>
        </section>

        <section id="doa" className="section px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow text-[var(--gold)]">Doa Restu</p>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--navy-dark)] sm:text-4xl lg:text-5xl">
              Merupakan kebahagiaan bagi kami
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-sm leading-8 text-[var(--muted)] sm:text-lg sm:leading-9">
              Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan
              terima kasih. Semoga Allah SWT senantiasa melimpahkan rahmat,
              keberkahan, dan kebahagiaan untuk kita semua.
            </p>
            <p className="mt-8 text-sm font-medium text-[var(--foreground)] sm:mt-10 sm:text-lg">
              Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
            </p>
            <p className="script-title mt-6 text-5xl leading-none text-[var(--navy-dark)] sm:mt-8 sm:text-6xl">
              Roudlotul & Ilham
            </p>
          </div>
        </section>

        <section id="peta" className="section px-4 md:px-8" aria-label="Peta Lokasi">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <p className="eyebrow text-[var(--gold)]">Peta Lokasi</p>
              <h2>Petunjuk Arah</h2>
              <p>
                Gunakan peta di bawah ini untuk memandu perjalanan Anda menuju lokasi acara.
              </p>
            </div>
            <div className="mt-10 h-80 w-full overflow-hidden rounded-xl border border-[var(--navy-dark)]/10 shadow-sm sm:h-[450px]">
              <iframe
                src="https://maps.google.com/maps?q=-7.093457,110.610134&hl=id&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-8 text-center">
              <a
                className="primary-button inline-flex justify-center"
                href="https://www.google.com/maps/search/?api=1&query=-7.093457,110.610134"
                rel="noreferrer"
                target="_blank"
              >
                Buka di Google Maps
              </a>
            </div>
          </div>
        </section>

        <section className="section gallery-section px-4 md:px-8" aria-label="Galeri foto">
          <div className="mx-auto max-w-6xl">
            <div className="section-heading">
              <p className="eyebrow text-[var(--gold)]">Galeri</p>
              <h2>Potret Bahagia Kami</h2>
              <p>
                Sedikit cerita dalam gambar, menjadi kenangan yang kami syukuri
                menjelang hari bahagia.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <figure className="gallery-card">
                <Image
                  src="/1.jpeg"
                  alt="Roudlotul dan Ilham saling menatap"
                  width={1080}
                  height={1920}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </figure>
              <figure className="gallery-card">
                <Image
                  src="/2.jpeg"
                  alt="Roudlotul dan Ilham menunjukkan cincin"
                  width={1080}
                  height={1920}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </figure>
            </div>
          </div>
        </section>

        <footer className="relative overflow-hidden px-4 py-12 text-center text-white md:px-8 md:py-16">
          <div className="footer-watercolor" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold-soft)] sm:text-sm">
              Minggu Legi, 24 Mei 2026
            </p>
            <p className="mt-4 text-xs text-white/75 sm:text-sm">Roudlotul Jannah & Muhammad Ilham Rifa&apos;i</p>
          </div>
        </footer>

        <button
          aria-label={isMusicPlaying ? "Matikan musik" : "Putar musik"}
          className="music-button"
          type="button"
          onClick={toggleMusic}
        >
          <span className={isMusicPlaying ? "music-wave playing" : "music-wave"} />
          {isMusicPlaying ? "Pause" : "Music"}
        </button>
      </div>
    </main>
  );
}
