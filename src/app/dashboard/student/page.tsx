import { PlayCircle, Flame, Medal, Award, Star, Compass, ArrowRight, Globe, Swords, School, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import OpenAIAssistantButton from '@/components/OpenAIAssistantButton'
import { LearningJourney } from '@/components/LearningJourney'
import { CustomTopicsList } from '@/components/student/CustomTopicsList'
import { Logo } from '@/components/Logo'
import { SignOutButton } from '@/components/SignOutButton'
import { BOOK_LESSONS, getTotalTopicCount, isTopicEnabled, TOPIC_MARKETING, EXPLORER_MAP_LABEL } from '@/data/curriculum'
import { getCurriculumFromDb, getUserBadges, getCountries, mergeCurriculumWithFallback, getProfile, getClassroomLeaderboard } from '@/lib/db/platform'
import { requireRole } from '@/lib/auth/dashboard-access'
import { getLocale, getTranslations, getLocalizedLesson } from '@/lib/i18n/i18n'
import { LanguageSelector } from '@/components/LanguageSelector'
import { JoinClassroomForm } from '@/components/JoinClassroomForm'
import { getStudentClassroomsAction } from '@/app/dashboard/teacher/actions'

export default async function StudentDashboard() {
  const { user } = await requireRole(['student', 'teacher', 'admin'])

  let curriculum = mergeCurriculumWithFallback(null, user.user_metadata)
  let earnedBadges: (string | number)[] = user.user_metadata?.earned_badges ?? []

  try {
    const dbCurriculum = await getCurriculumFromDb(user.id)
    curriculum = mergeCurriculumWithFallback(dbCurriculum, user.user_metadata)
    const dbBadges = await getUserBadges(user.id)
    if (dbBadges.length) earnedBadges = dbBadges
  } catch { /* fallback to metadata until migration applied */ }
  let userProgress: any[] = []
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabaseClient = await createClient()
    const { data: progress } = await supabaseClient
      .from('user_progress')
      .select('topic_id, status')
      .eq('user_id', user.id)
    if (progress) userProgress = progress
  } catch (e) {
    console.error('Failed to load user progress:', e)
  }
  let studentClassrooms: any[] = []
  try {
    const res = await getStudentClassroomsAction()
    if (res.success && res.classrooms) {
      studentClassrooms = res.classrooms
    }
  } catch (e) {
    console.error('Failed to load linked classrooms:', e)
  }

  let leaderboard: any[] = []
  try {
    leaderboard = await getClassroomLeaderboard(user.id)
  } catch (e) {
    console.error('Failed to load leaderboard:', e)
  }

  const profile = await getProfile(user.id)
  const countries = await getCountries()
  const country = countries.find((c) => c.code === (profile?.country_code ?? curriculum.countryCode))

  const locale = await getLocale()
  const dict = await getTranslations(locale)
  
  // Helper for dot-notation lookup on server
  const t = (path: string): string => {
    const parts = path.split('.')
    let current = dict
    for (const part of parts) {
      if (current == null) return path
      current = current[part]
    }
    return typeof current === 'string' ? current : path
  }

  const firstName = profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? user.user_metadata?.full_name?.split(' ')[0] ?? 'Explorer'
  
  // Localize chapter titles
  const localizedBookLessons = await Promise.all(
    BOOK_LESSONS.map(async (lesson) => {
      const loc = await getLocalizedLesson(lesson.id, locale)
      return {
        ...lesson,
        title: loc?.title || lesson.title,
      }
    })
  )

  const enabledLessons = localizedBookLessons.filter((l) => isTopicEnabled(l.id, curriculum))
  const totalTopics = getTotalTopicCount(curriculum)
  const activeLesson = enabledLessons.find((l) => !earnedBadges.map(String).includes(String(l.id))) || enabledLessons[0]
  const completedCount = earnedBadges.filter((id) => enabledLessons.some((l) => String(l.id) === String(id))).length
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col bg-brand-gradient dark:bg-brand-gradient-dark font-sans text-brand-purple dark:text-brand-cream">
      <header className="border-b border-brand-purple/10 dark:border-brand-gold/10 bg-brand-surface/90 dark:bg-brand-purple-dark/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/"><Logo showWordmark size="md" /></Link>
          <div className="flex items-center gap-4">
            <LanguageSelector showLabel={false} />
            {country && (
              <span className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/5 dark:bg-brand-gold/5 border border-brand-purple/10 text-sm">
                {country.flag_emoji} {country.name}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 space-y-10 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
                {t('dashboard.hello')} <span className="text-gradient">{firstName}</span>
              </h1>
              <p className="text-brand-purple/60 dark:text-brand-cream/60">
                {t('landing.hero_desc')}
              </p>
            </div>

            {activeLesson && (
              <div className="rounded-2xl border border-brand-purple/10 dark:border-brand-gold/10 bg-brand-surface dark:bg-brand-purple-dark p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  {t('dashboard.active_lesson')}
                </div>
                <h2 className="text-2xl font-bold mb-3">{activeLesson.title}</h2>
                <p className="text-brand-purple/60 dark:text-brand-cream/60 mb-6">{activeLesson.category}</p>
                <Link href={`/lesson/${activeLesson.id}`}>
                  <Button className="rounded-full px-8 h-12 bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark font-semibold">
                    <PlayCircle className="mr-2 h-5 w-5" /> {t('dashboard.start_lesson')}
                  </Button>
                </Link>
              </div>
            )}

            {curriculum.customTopics.length > 0 && (
              <CustomTopicsList
                customTopics={curriculum.customTopics.map((tCustom) => ({
                  id: tCustom.id,
                  title: tCustom.title,
                  description: tCustom.description,
                  contentStatus: tCustom.contentStatus,
                  badgeName: tCustom.badgeName,
                }))}
                earnedBadges={earnedBadges}
                userProgress={userProgress}
                badgesLabel={t('dashboard.badges')}
                completedLabel={t('dashboard.completed')}
                preparingLabel={t('dashboard.preparing')}
                startLabel={t('dashboard.start')}
                continueLabel="Continue"
                reviewLabel="Review"
                titleLabel={t('dashboard.custom_topics_title')}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/#topics" className="p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 hover:border-brand-gold/30 transition-colors group flex items-center justify-between">
                <div><Compass className="h-6 w-6 text-brand-gold mb-2" /><div className="font-bold text-sm">{EXPLORER_MAP_LABEL}</div></div>
                <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
              </Link>
              <Link href="/community" className="p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 hover:border-brand-gold/30 transition-colors group flex items-center justify-between">
                <div><Globe className="h-6 w-6 text-brand-gold mb-2" /><div className="font-bold text-sm">{country?.name ?? t('nav.community')}</div></div>
                <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
              </Link>
              {curriculum.allowMatchQuiz && (
                <Link href="/match-quiz" className="p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 hover:border-brand-gold/30 transition-colors group flex items-center justify-between">
                  <div><Swords className="h-6 w-6 text-brand-gold mb-2" /><div className="font-bold text-sm">{t('dashboard.match_quiz')}</div></div>
                  <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                </Link>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                <Compass className="h-6 w-6 text-brand-gold" /> {t('dashboard.my_learning_journey')}
              </h2>
              <p className="text-sm text-brand-purple/55 dark:text-brand-cream/55 -mt-4">
                {t('dashboard.journey_subtitle')}
              </p>
              <LearningJourney
                completedLessonIds={earnedBadges}
                activeLessonId={activeLesson?.id}
                disabledTopicIds={curriculum.disabledTopics}
                customTopics={curriculum.customTopics.map((tCustom) => ({
                  id: tCustom.id,
                  title: tCustom.title,
                  description: tCustom.description,
                  badgeName: tCustom.badgeName,
                  contentStatus: tCustom.contentStatus,
                  illustrationUrl: tCustom.illustrationUrl,
                }))}
              />
            </div>

            {/* Interactive Activity Packs Section */}
            <div className="space-y-4 pt-6">
              <h3 className="font-heading font-bold text-xl text-brand-purple dark:text-brand-cream flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-brand-gold" strokeWidth={1.5} /> Interactive Activity Packs
              </h3>
              <div className="p-6 rounded-2xl border border-brand-gold/25 bg-gradient-to-r from-brand-surface to-brand-warm/20 dark:from-brand-purple-dark/60 dark:to-brand-purple-dark/30 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">Book 1 Companion Workbook · 13 Pages</div>
                  <div className="text-lg font-bold text-brand-purple dark:text-brand-cream">Young AI Explorers Activity Pack</div>
                  <div className="text-xs text-brand-purple/60 dark:text-brand-cream/60">
                    Solve crossword puzzles, 15×15 word searches, robot design blueprints, and Mission 1: Invent an AI That Solves a Problem!
                  </div>
                </div>
                <Link
                  href="/activity-pack"
                  className="shrink-0 px-5 py-2.5 rounded-full bg-brand-purple dark:bg-brand-gold text-brand-cream dark:text-brand-purple-dark font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                >
                  Start Workbook ➜
                </Link>
              </div>
            </div>

            {earnedBadges.length > 0 && (
              <div id="certificates" className="space-y-4 pt-6 scroll-mt-28">
                <h3 className="font-heading font-bold text-xl text-brand-purple dark:text-brand-cream flex items-center gap-2">
                  <Award className="h-6 w-6 text-emerald-500" strokeWidth={1.5} /> Earned Certificates
                </h3>
                <p className="text-sm text-brand-purple/55 dark:text-brand-cream/55 -mt-2">
                  Click any certificate below to view, print, or download your official credentials!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {earnedBadges.map((badgeId) => {
                    const lesson = BOOK_LESSONS.find(l => String(l.id) === String(badgeId));
                    const title = lesson?.title ?? `Custom Topic (${badgeId})`;
                    return (
                      <Link 
                        key={badgeId} 
                        href={`/certificate/${badgeId}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-brand-purple/10 dark:border-brand-gold/15 bg-brand-surface dark:bg-brand-purple-dark/40 hover:border-brand-gold/45 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-sm font-bold truncate max-w-[200px] text-brand-purple dark:text-brand-cream group-hover:text-brand-gold transition-colors">{title}</div>
                            <div className="text-[10px] text-brand-purple/50 dark:text-brand-cream/50">Completed & Verified</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-purple/60 dark:text-brand-gold group-hover:text-brand-purple dark:group-hover:text-brand-cream transition-colors">
                          View Cert ➜
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 shrink-0 space-y-4">
            <h3 className="font-heading font-bold text-lg px-2 text-brand-purple dark:text-brand-cream">{t('dashboard.your_progress')}</h3>
            <div className="p-6 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 dark:border-brand-gold/15 text-center">
              <div className="text-4xl font-bold text-gradient mb-1">{progressPct}%</div>
              <div className="text-sm text-brand-purple/50 dark:text-brand-cream/65">
                {completedCount} {t('dashboard.of')} {totalTopics} {t('dashboard.enabled')} · {t('dashboard.unlimited_custom')}
              </div>
            </div>
             {[
              { icon: Flame, label: t('dashboard.streak'), value: '—', color: 'text-orange-500', href: undefined },
              { icon: Medal, label: t('dashboard.badges'), value: `${completedCount}/${totalTopics}+`, color: 'text-brand-gold', href: undefined },
              { icon: Star, label: t('dashboard.xp'), value: String(completedCount * 120), color: 'text-brand-purple dark:text-brand-gold', href: undefined },
              { icon: Award, label: t('dashboard.certificates'), value: String(Math.floor(completedCount / 6)), color: 'text-emerald-600 dark:text-emerald-400', href: earnedBadges.length > 0 ? '#certificates' : undefined },
            ].map(({ icon: Icon, label, value, color, href }) => {
              const cardContent = (
                <>
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/5 dark:bg-brand-gold/10 flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-brand-purple/50 dark:text-brand-cream/65">{label}</div>
                    <div className="text-xl font-bold text-brand-purple dark:text-brand-cream">{value}</div>
                  </div>
                </>
              );

              const cardClass = `p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 dark:border-brand-gold/15 flex items-center gap-4 text-left w-full ${
                href ? 'hover:border-brand-gold/55 hover:shadow-sm cursor-pointer transition-all hover:scale-[1.01]' : ''
              }`;

              if (href) {
                return (
                  <Link key={label} href={href} className={cardClass}>
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div key={label} className={cardClass}>
                  {cardContent}
                </div>
              );
            })}
            {leaderboard.length > 0 && (
              <div className="p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 dark:border-brand-gold/15 shadow-sm space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-brand-purple dark:text-brand-cream">
                  <Medal className="h-5 w-5 text-brand-gold" />
                  <h4 className="font-heading font-bold text-sm">Classroom Leaderboard</h4>
                </div>
                <div className="space-y-2.5">
                  {leaderboard.map((item, index) => {
                    const isTop3 = index < 3;
                    const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.isSelf 
                            ? "bg-brand-purple/5 dark:bg-brand-gold/10 border-brand-gold/45 shadow-[0_2px_8px_rgba(201,160,78,0.08)] scale-[1.02]" 
                            : "bg-brand-warm/20 dark:bg-brand-purple-dark/30 border-brand-purple/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`text-sm font-bold w-5 shrink-0 ${isTop3 ? "text-lg" : "text-brand-purple/40 dark:text-brand-cream/40"}`}>
                            {rankEmoji}
                          </span>
                          <span className={`text-xs font-bold truncate ${item.isSelf ? "text-brand-purple dark:text-brand-gold" : "text-brand-purple/80 dark:text-brand-cream/80"}`}>
                            {item.nickname}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-brand-gold bg-brand-gold/5 border border-brand-gold/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {item.xp} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {studentClassrooms.length > 0 && (
              <div className="p-5 rounded-2xl bg-brand-surface dark:bg-brand-purple-dark border border-brand-purple/10 dark:border-brand-gold/15 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-brand-purple dark:text-brand-cream">
                  <School className="h-5 w-5 text-brand-gold" />
                  <h4 className="font-heading font-bold text-sm">Linked Classrooms</h4>
                </div>
                <div className="space-y-2">
                  {studentClassrooms.map((link) => (
                    <div key={link.classroom_id} className="text-xs font-semibold p-2.5 rounded-xl bg-brand-warm/30 dark:bg-brand-purple-dark/50 border border-brand-purple/5 flex justify-between items-center">
                      <span className="truncate">{link.classrooms?.name}</span>
                      <span className="text-[10px] font-mono text-brand-gold uppercase shrink-0 ml-2">{link.classrooms?.class_code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <JoinClassroomForm />
            <OpenAIAssistantButton />
          </div>
        </div>
      </main>
    </div>
  )
}
