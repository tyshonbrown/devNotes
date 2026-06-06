"use client";

import Link from "next/link";
import Logo from "../components/logo";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    sessionStorage.removeItem("token");
  }, []);
  return (
    <main className="min-h-screen bg-blue-950/20 text-gray-100">
      {/* Navigation Bar */}
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Logo />

          {/* Navigation Items */}
          <div className="hidden items-center gap-8 text-lg text-gray-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>

            <a href="#workflow" className="transition-colors hover:text-white">
              Workflow
            </a>

            <a href="#about" className="transition-colors hover:text-white">
              About
            </a>
          </div>

          {/* Login / Signup */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-md text-gray-300 transition-colors hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-blue-500 px-5 py-2 text-md font-medium text-white transition hover:bg-blue-400"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Introduction */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 mb-4">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
              <span className="mr-2 h-2 w-2 rounded-full bg-blue-400" />
              For snippets, bugs, ideas, and everything in between
            </div>

            <h2 className="font-semibold leading-tight tracking-tight text-white text-5xl xl:text-7xl">
              Store the solution.
              <br />
              Keep the context.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              <span className="font-mono font-extralight text-blue-400">
                dev
              </span>
              <span className="font-serif font-medium text-gray-100">
                Notes
              </span>{" "}
              helps you organize code snippets, project ideas, debugging steps,
              and technical notes in one focused workspace.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="rounded-full bg-blue-500 px-7 py-3 font-medium text-white transition hover:bg-blue-400"
              >
                Start Taking Notes
              </Link>

              <a
                href="#features"
                className="rounded-full border border-white/10 bg-white/5 px-7 py-3 font-medium text-gray-200 transition hover:border-blue-400/50 hover:bg-white/10"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 bg-gray-950/80 p-4 shadow-2xl shadow-blue-950/30">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <p className="ml-3 text-sm text-gray-500">devNotes</p>
            </div>

            <img
              src="/images/Note-Example.png"
              alt="Example JavaScript note in devNotes"
              className="w-full rounded-xl border border-white/10 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Features
            </p>

            <h3 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              A simple place to save the coding notes you actually use.
            </h3>

            <p className="mt-5 text-lg leading-8 text-gray-400">
              Keep track of snippets, syntax reminders, debugging tips, and
              project notes without digging through old files, bookmarks, or
              random comments in your code.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                01
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Save developer notes
              </h4>

              <p className="leading-7 text-gray-400">
                Store quick notes for React, JavaScript, TypeScript, backend
                logic, MongoDB queries, API routes, and anything else you want
                to remember.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                02
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Keep code snippets with context
              </h4>

              <p className="leading-7 text-gray-400">
                Save snippets with notes explaining what the code does, when to
                use it, and what problem it solved, so it is useful later.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                03
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Organize by topic
              </h4>

              <p className="leading-7 text-gray-400">
                Group notes by language, framework, project, or topic. Use
                categories like React, CSS, Express, MongoDB, bugs, auth, or
                project ideas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                04
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Save debugging tips
              </h4>

              <p className="leading-7 text-gray-400">
                Write down the small fixes that save time, like checking if an
                array is undefined before using map(), or using the Network tab
                when fetch fails.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                05
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Pin important notes
              </h4>

              <p className="leading-7 text-gray-400">
                Favorite the notes you use the most, like common syntax, setup
                steps, reusable functions, or reminders you keep coming back to.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-7 transition">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                06
              </div>

              <h4 className="mb-3 text-xl font-semibold text-white">
                Find notes faster
              </h4>

              <p className="leading-7 text-gray-400">
                Search through saved notes, filter by topic, and jump back into
                recently viewed notes when you need to revisit something.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-semibold text-sm uppercase tracking-[0.3em] text-blue-400">
              Workflow
            </p>

            <h3 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Add a note. Find it when you need it.
            </h3>

            <p className="mt-6 leading-8 text-gray-400">
              devNotes keeps the process simple: save the note, organize it, and
              come back to it later without overthinking it.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gray-950 p-5">
              <p className="text-sm text-blue-400">Step 1</p>
              <h4 className="mt-2 text-xl font-semibold text-white">
                Write the note
              </h4>
              <p className="mt-2 text-gray-400">
                Add the title, topic, explanation, and code snippet.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gray-950 p-5">
              <p className="text-sm text-blue-400">Step 2</p>
              <h4 className="mt-2 text-xl font-semibold text-white">
                Mark what matters
              </h4>
              <p className="mt-2 text-gray-400">
                Add a category, favorite important notes, or leave it simple.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gray-950 p-5">
              <p className="text-sm text-blue-400">Step 3</p>
              <h4 className="mt-2 text-xl font-semibold text-white">
                Use it again
              </h4>
              <p className="mt-2 text-gray-400">
                Search, filter, copy the snippet, or open a recently viewed
                note.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-semibold text-sm tracking-[0.3em] text-white">
              <span className="uppercase text-blue-400">About</span>{" "}
              <span className="text-blue-400">dev</span>Notes
            </p>

            <p className="mx-auto mt-6 text-lg leading-8 text-gray-400">
              devNotes is a personal note-taking app for developers. The goal is
              to give you one focused place to save the coding notes, reminders,
              and examples you want to come back to later.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="mt-14 rounded-2xl border border-white/10 bg-gray-500/10 p-6 md:p-8">
            <p className="mb-6 text-sm uppercase tracking-[0.25em] text-blue-400">
              Tech Stack
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">Frontend</p>
                <h4 className="text-xl font-semibold text-white">Next.js</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Used for the app structure, pages, and frontend experience.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">Language</p>
                <h4 className="text-xl font-semibold text-white">TypeScript</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Helps keep the code cleaner and easier to maintain.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">Styling</p>
                <h4 className="text-xl font-semibold text-white">
                  Tailwind CSS
                </h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Used to build the dark UI, spacing, layout, and responsive
                  design.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">Backend</p>
                <h4 className="text-xl font-semibold text-white">Node.js</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Runs the server-side logic for the app.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">API</p>
                <h4 className="text-xl font-semibold text-white">Express</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Handles the routes for creating, updating, deleting, and
                  loading notes.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-gray-950 p-5">
                <p className="mb-2 text-sm text-blue-400">Database</p>
                <h4 className="text-xl font-semibold text-white">MongoDB</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Stores user notes, snippets, categories, and saved note data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
