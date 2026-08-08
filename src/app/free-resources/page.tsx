"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Globe, Search, Sparkles, BookOpen } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavBar } from "@/components/NavBar";

interface Resource {
  id: string;
  title: string;
  category: "Teachers" | "Parents" | "Kids" | "General";
  description: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  icon: any;
}

export default function FreeResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const resources: Resource[] = [
    {
      id: "activity-pack",
      title: "AI Explorer Offline Activity Pack",
      category: "Parents",
      description: "Fun offline activities including matching puzzles, crossword searches, and badge cutouts designed to complement the book chapters.",
      fileType: "PDF Document",
      fileSize: "4.2 MB",
      downloadUrl: "https://lvdygbetmlqjnhrmvwjq.supabase.co/storage/v1/object/public/free-resources/ai-explorer-activity-pack.pdf",
      icon: Sparkles,
    },
    {
      id: "teacher-slides",
      title: "Neural Networks & ML Classroom Slides",
      category: "Teachers",
      description: "Ready-to-use lesson slides explaining machine learning, neurons, and classification with kid-friendly diagrams and simple analogies.",
      fileType: "PowerPoint Presentation",
      fileSize: "8.5 MB",
      downloadUrl: "https://lvdygbetmlqjnhrmvwjq.supabase.co/storage/v1/object/public/free-resources/ml-classroom-slides.pptx",
      icon: BookOpen,
    },
    {
      id: "student-workbook",
      title: "Vision Vee Classroom Workbook",
      category: "Kids",
      description: "Printable review workbook containing quiz sheets, code-along tasks, and project sheets for classroom groups.",
      fileType: "PDF Document",
      fileSize: "6.1 MB",
      downloadUrl: "https://lvdygbetmlqjnhrmvwjq.supabase.co/storage/v1/object/public/free-resources/vision-vee-classroom-workbook.pdf",
      icon: FileText,
    },
    {
      id: "explorer-passport",
      title: "Printable Explorer Passport & Stamps",
      category: "Kids",
      description: "A printable physical passport book where students can draw or stick badge cutouts as they complete digital platform milestones.",
      fileType: "PDF Document",
      fileSize: "2.8 MB",
      downloadUrl: "https://lvdygbetmlqjnhrmvwjq.supabase.co/storage/v1/object/public/free-resources/printable-explorer-passport.pdf",
      icon: Globe,
    },
    {
      id: "curriculum-framework",
      title: "Young AI Explorers Curriculum Framework",
      category: "General",
      description: "Comprehensive guide outlining AI literacy standards, learning objectives, and age-appropriate guidelines from ages 8 to 15.",
      fileType: "PDF Document",
      fileSize: "1.9 MB",
      downloadUrl: "https://lvdygbetmlqjnhrmvwjq.supabase.co/storage/v1/object/public/free-resources/young-ai-explorers-curriculum-framework.pdf",
      icon: FileText,
    },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || 
                          res.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-gradient dark:bg-brand-gradient-dark text-brand-purple dark:text-brand-cream">
      <NavBar />

      <main className="container mx-auto px-6 pt-36 pb-24 max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/5 dark:bg-brand-gold/5 border border-brand-purple/10 dark:border-brand-gold/15 mb-4">
            <Download className="h-4 w-4 text-brand-gold" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-purple/80 dark:text-brand-cream/80">Educator & Parent Vault</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Free Resources</h1>
          <p className="text-brand-purple/65 dark:text-brand-cream/65 text-lg">
            Download printable activity packs, PowerPoint curriculum slides, and student workbooks to bring AI literacy into classrooms and homes.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark/40 border border-brand-purple/10 dark:border-brand-gold/10 mb-10 shadow-sm">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["All", "Teachers", "Parents", "Kids", "General"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark shadow-sm"
                    : "hover:bg-brand-purple/5 dark:hover:bg-brand-gold/5 text-brand-purple/70 dark:text-brand-cream/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-purple/40 dark:text-brand-cream/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-purple/10 dark:border-brand-gold/15 bg-brand-warm/20 dark:bg-brand-purple-dark/50 text-sm focus:outline-none focus:border-brand-gold text-brand-purple dark:text-brand-cream font-medium"
            />
          </div>
        </div>

        {/* Featured Hero: Activity Pack Book 1 */}
        {activeCategory === "All" && !search && (
          <div className="mb-10 p-8 md:p-10 rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-surface to-brand-warm/30 dark:from-brand-purple-dark/80 dark:to-brand-purple-dark/40 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold text-brand-purple-dark font-extrabold text-[10px] uppercase tracking-widest shadow-sm">
                  <Sparkles className="h-3 w-3" /> Featured Printable Workbook · 13 Pages
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-brand-purple dark:text-brand-cream leading-tight">
                  Young AI Explorers Activity Pack <span className="text-brand-gold font-serif italic font-normal">(Book 1)</span>
                </h2>
                <p className="text-sm text-brand-purple/70 dark:text-brand-cream/70 leading-relaxed">
                  13 pages of hands-on review questions, crossword challenges, 15×15 word searches, robot design canvas, and Mission 1: Invent an AI That Solves a Problem. Designed for children ages 9–12.
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-brand-purple/50 dark:text-brand-cream/50 pt-1">
                  <span>✏️ Written by Bassey Riman</span>
                  <span>·</span>
                  <span>📄 13 Pages</span>
                  <span>·</span>
                  <span>🎓 RimansTech Publishing</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                <Link
                  href="/activity-pack"
                  className="px-6 py-3.5 rounded-full bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark font-bold text-xs hover:opacity-90 transition-all text-center shadow-md flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" /> Open Digital Workbook
                </Link>
                <Link
                  href="/activity-pack"
                  className="px-6 py-3 rounded-full border border-brand-purple/20 dark:border-brand-gold/30 hover:bg-brand-purple/5 text-brand-purple dark:text-brand-cream font-bold text-xs transition-all text-center flex items-center justify-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" /> Print / Save PDF
                </Link>
              </div>
            </div>
          </div>
        )}
        {filteredResources.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-brand-purple/20 dark:border-brand-gold/20 bg-brand-surface/40">
            <FileText className="h-12 w-12 text-brand-purple/30 dark:text-brand-gold/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">No resources found</h3>
            <p className="text-sm text-brand-purple/50 dark:text-brand-cream/50">Try broadening your search criteria or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.id}
                  className="group p-6 rounded-2xl border border-brand-purple/10 dark:border-brand-gold/10 bg-brand-surface dark:bg-brand-purple-dark/40 flex flex-col justify-between hover:border-brand-gold/45 hover:shadow-[0_12px_40px_rgba(74,45,110,0.05)] transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-brand-purple/5 dark:bg-brand-gold/5 border border-brand-purple/10 dark:border-brand-gold/15 group-hover:border-brand-gold/35 transition-colors">
                        <Icon className="h-6 w-6 text-brand-gold" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-brand-purple/6 dark:bg-brand-gold/8 border border-brand-purple/8 dark:border-brand-gold/10 text-brand-gold">
                        {res.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-gold transition-colors">{res.title}</h3>
                    <p className="text-sm text-brand-purple/60 dark:text-brand-cream/60 leading-relaxed mb-6">
                      {res.description}
                    </p>
                  </div>

                  <div className="border-t border-brand-purple/8 dark:border-brand-gold/8 pt-4 flex items-center justify-between gap-4">
                    <div className="text-xs text-brand-purple/50 dark:text-brand-cream/50">
                      <span className="font-semibold text-brand-purple/75 dark:text-brand-cream/75">{res.fileType}</span> · {res.fileSize}
                    </div>

                    <Link
                      href={res.downloadUrl}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark text-xs font-bold hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(74,45,110,0.15)]"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
