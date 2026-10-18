import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PageTransition } from '../shared/page-transition';

export interface GitHubStats {
  totalStars: number;
  totalForks: number;
  repositories: number;
  followers: number;
  avatarUrl: string;
  username: string;
  profileUrl: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface PinnedRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
}

export interface Project {
  id: number;
  name: string;
  about: string;
  tags: string[];
  image?: string;
  videoUrl?: string;
  images?: string[];
  links: {
    backend?: string;
    frontend?: string;
    github?: string;
  };
}

export type TabType = 'projects' | 'developer';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent extends PageTransition implements OnInit {
  private readonly GITHUB_USERNAME = 'Ali-Ahmed-Farag';
  private readonly GITHUB_PROXY = '/api/github';

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  activeTab = signal<TabType>('projects');

  searchQuery = signal('');
  activeFilters = signal<string[]>([]);

  githubLoading = signal(true);
  githubError = signal(false);
  githubStats = signal<GitHubStats | null>(null);
  pinnedRepos = signal<PinnedRepo[]>([]);
  contributionWeeks = signal<ContributionWeek[]>([]);
  totalContributions = signal(0);
  selectedYear = signal(new Date().getFullYear());

  // ─── Video Modal ─────────────────────────────────────────────────────────
  activeVideoUrl = signal<string | null>(null);

  openVideo(url: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeVideoUrl.set(url);
    document.body.style.overflow = 'hidden';
  }

  closeVideo() {
    this.activeVideoUrl.set(null);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('video-modal-backdrop')) {
      this.closeVideo();
    }
  }

  // ─── Image Gallery Modal ──────────────────────────────────────────────────
  activeGallery = signal<{ images: string[]; currentIndex: number } | null>(null);

  openGallery(images: string[], event: MouseEvent) {
    event.stopPropagation();
    this.activeGallery.set({ images, currentIndex: 0 });
    document.body.style.overflow = 'hidden';
  }

  closeGallery() {
    this.activeGallery.set(null);
    document.body.style.overflow = '';
  }

  onGalleryBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('gallery-modal-backdrop')) {
      this.closeGallery();
    }
  }

  nextImage() {
    const g = this.activeGallery();
    if (!g) return;
    this.activeGallery.set({
      ...g,
      currentIndex: (g.currentIndex + 1) % g.images.length,
    });
  }

  prevImage() {
    const g = this.activeGallery();
    if (!g) return;
    this.activeGallery.set({
      ...g,
      currentIndex: (g.currentIndex - 1 + g.images.length) % g.images.length,
    });
  }

  goToImage(index: number) {
    const g = this.activeGallery();
    if (!g) return;
    this.activeGallery.set({ ...g, currentIndex: index });
  }
  // ─────────────────────────────────────────────────────────────────────────

  readonly availableYears = computed(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  });

  readonly monthLabels = computed(() => {
    const weeks = this.contributionWeeks();
    if (!weeks.length) return [];

    const months: { label: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, i) => {
      const firstDay = week.days.find(d => d.date);
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        months.push({
          label: new Date(firstDay.date).toLocaleString('en', { month: 'short' }),
          index: i,
        });
        lastMonth = month;
      }
    });

    return months;
  });

  get isLight(): boolean {
    return document.documentElement.hasAttribute('data-theme');
  }

  ngOnInit() {
    this.loadGitHubData();
    this.initPageTransition(this.router);
  }

  protected override onEdgeScrollUp() {
    this.startTransition('Stack', '/stack');
  }

  async loadGitHubData() {
    this.githubLoading.set(true);
    this.githubError.set(false);
    try {
      await Promise.all([
        this.fetchUserStats(),
        this.fetchContributions(),
      ]);
    } catch {
      this.githubError.set(true);
    } finally {
      this.githubLoading.set(false);
    }
  }

  private async fetchUserStats() {
    const user = await fetch(
      `${this.GITHUB_PROXY}?endpoint=users/${this.GITHUB_USERNAME}`
    ).then((r) => r.json());

    let repos: any[] = [];
    let page = 1;
    while (true) {
      const batch: any[] = await fetch(
        `${this.GITHUB_PROXY}?endpoint=user/repos%3Ftype%3Dall%26per_page%3D100%26page%3D${page}`
      ).then((r) => r.json());
      if (!Array.isArray(batch) || !batch.length) break;
      repos = [...repos, ...batch];
      if (batch.length < 100) break;
      page++;
    }

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    this.githubStats.set({
      totalStars,
      totalForks,
      repositories: user.public_repos || repos.length,
      followers: user.followers || 0,
      avatarUrl: user.avatar_url,
      username: user.login,
      profileUrl: user.html_url,
    });

    const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    this.pinnedRepos.set(
      sorted.map((r) => ({
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || '',
      }))
    );
  }

  private async fetchContributions() {
    try {
      const year = this.selectedYear();
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${this.GITHUB_USERNAME}?y=${year}`
      );
      const data = await res.json();

      const contributions: ContributionDay[] = data.contributions || [];
      this.totalContributions.set(
        contributions.reduce((s: number, d: ContributionDay) => s + d.count, 0)
      );

      const weeks: ContributionWeek[] = [];
      for (let i = 0; i < contributions.length; i += 7) {
        weeks.push({ days: contributions.slice(i, i + 7) });
      }
      this.contributionWeeks.set(weeks);
    } catch {
      this.contributionWeeks.set([]);
    }
  }

  private async fetchPinnedRepos() {}

  async changeYear(year: number) {
    this.selectedYear.set(year);
    await this.fetchContributions();
  }

  getLevelColor(level: number): string {
    const colors = ['#1a1a1a', '#1e3a5f', '#2563EB', '#3B82F6', '#60A5FA'];
    return colors[level] ?? colors[0];
  }

  getLangColor(lang: string): string {
    const map: Record<string, string> = {
      'TypeScript': '#3178C6',
      'JavaScript': '#F7DF1E',
      'C#': '#239120',
      'Python': '#3776AB',
      'HTML': '#E34F26',
      'CSS': '#1572B6',
      'SCSS': '#CC6699',
      'Dart': '#0175C2',
    };
    return map[lang] ?? '#6B7280';
  }

  openGitHub() {
    window.open(`https://github.com/${this.GITHUB_USERNAME}`, '_blank');
  }

  playVideo(event: MouseEvent) {
    const video = event.currentTarget as HTMLVideoElement;
    video.muted = true;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {});
    }
  }

  pauseVideo(event: MouseEvent) {
    const video = event.currentTarget as HTMLVideoElement;
    video.pause();
    video.currentTime = 0;
  }

  // ─── Projects List ────────────────────────────────────────────────────────
  readonly allProjects: Project[] = [
    {
      id: 1,
      name: 'E-Commerce Database Design',
      about:
        'A normalized (3NF) PostgreSQL database for an e-commerce store, built on the real Olist dataset with 7 tables and 112K+ order rows. Includes SQL analytics using CTEs and Window Functions, plus a delivery-performance query across 27 states.',
      tags: ['PostgreSQL', 'SQL', 'Python', 'Pandas', 'Docker'],
      image: 'assets/projects/db-design.png',
      links: {
        github: 'https://github.com/Ali-Ahmed-Farag/ecommerce-database-design',
      },
    },
    {
      id: 2,
      name: 'E-Commerce ETL Pipeline (Apache Airflow)',
      about:
        'A daily Airflow pipeline that ingests sales data from CSV files and public holidays from an API, loading it through 3 layers (raw → staging → production). Features idempotent re-runs and a data-quality check that fails the run on bad data. Tested with a full backfill: 1,096 days and 7,672 tasks with zero failures.',
      tags: ['Python', 'Airflow', 'PostgreSQL', 'Docker', 'Pandas', 'pytest'],
      image: 'assets/projects/etl-pipeline.png',
      images: [
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline/main/docs/screenshots/grid_success.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline/main/docs/screenshots/retry_attempt1_start.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline/main/docs/screenshots/retry_attempt1_fail.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline/main/docs/screenshots/try_number_2.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline/main/docs/screenshots/retry_attempt2.png',
      ],
      links: {
        github: 'https://github.com/Ali-Ahmed-Farag/ecommerce-etl-pipeline',
      },
    },
    {
      id: 3,
      name: 'E-Commerce Sales Dashboard (Star Schema + Power BI)',
      about:
        'An analytical Star Schema (4 dimensions and a 112,650-row fact table as a Materialized View) refreshed automatically from inside the Airflow DAG. On top sits a 3-page Power BI dashboard with DAX measures validated against reference SQL values, such as Total Sales of 15.84M and AOV of 160.58.',
      tags: ['Power BI', 'DAX', 'PostgreSQL', 'SQL', 'Star Schema', 'Airflow', 'Docker'],
      image: 'assets/projects/sales-dashboard.png',
      images: [
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-sales-dashboard/main/docs/dashboard_screenshots/sales_overview.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-sales-dashboard/main/docs/dashboard_screenshots/product_analysis.png',
        'https://raw.githubusercontent.com/Ali-Ahmed-Farag/ecommerce-sales-dashboard/main/docs/dashboard_screenshots/delivery_holiday_impact.png',
      ],
      links: {
        github: 'https://github.com/Ali-Ahmed-Farag/ecommerce-sales-dashboard',
      },
    },
    {
      id: 4,
      name: 'LMS AI Service',
      about:
        'The AI service component of a larger LMS platform. It generates quizzes from lesson content and produces student weakness reports from quiz performance. It runs a deterministic topic-level performance analysis, then uses an LLM (NVIDIA Nemotron 3 Super through the OpenRouter API) to generate personalized learning recommendations. The REST APIs include input validation, structured JSON responses, service-to-service authentication, error handling, and fallback recommendations.',
      tags: ['Python', 'FastAPI', 'Pydantic', 'LLM', 'OpenRouter', 'pytest', 'Postman', 'Vercel'],
      image: 'assets/projects/lms-ai-service.png',
      links: {
        backend: 'https://lms-ai-service.vercel.app/docs',
        github: 'https://github.com/DevOraIntern2026/LMS-Platform_Team9',
      },
    },
  ];

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.allProjects.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  });

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filters = this.activeFilters();

    return this.allProjects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.about.toLowerCase().includes(query) ||
        project.tags.some((t) => t.toLowerCase().includes(query));

      const matchesFilter =
        filters.length === 0 ||
        filters.every((f) => project.tags.includes(f));

      return matchesSearch && matchesFilter;
    });
  });

  setTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  toggleFilter(tag: string) {
    const current = this.activeFilters();
    if (current.includes(tag)) {
      this.activeFilters.set(current.filter((t) => t !== tag));
    } else {
      this.activeFilters.set([...current, tag]);
    }
  }

  isFilterActive(tag: string): boolean {
    return this.activeFilters().includes(tag);
  }

  onSearch(value: string) {
    this.searchQuery.set(value);
  }

  getTagIcon(tag: string): string {
    const iconMap: Record<string, string> = {
      Python: 'assets/icons/python-original.svg',
      SQL: 'assets/icons/postgresql-original.svg',
      PostgreSQL: 'assets/icons/postgresql-original.svg',
      Pandas: 'assets/icons/pandas-original.svg',
      PySpark: 'assets/icons/apachespark-original.svg',
      'ETL/ELT': 'assets/icons/apacheairflow-original.svg',
      Airflow: 'assets/icons/apacheairflow-original.svg',
      Docker: 'assets/icons/docker-original.svg',
      AWS: 'assets/icons/amazonwebservices-original-wordmark.svg',
      FastAPI: 'assets/icons/fastapi-original.svg',
      RAG: 'assets/icons/database-svgrepo-com.svg',
      Database: 'assets/icons/database-svgrepo-com.svg',
    };
    return iconMap[tag] || '';
  }

  openLink(url: string) {
    window.open(url, '_blank', 'noopener noreferrer');
  }
}
