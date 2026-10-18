import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTransition } from '../shared/page-transition';

@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent extends PageTransition implements OnInit {

  get isLight(): boolean {
    return document.documentElement.hasAttribute('data-theme');
  }

  techs = [
    { name: 'Python',           icon: 'assets/icons/python-original.svg'               },
    { name: 'PostgreSQL',       icon: 'assets/icons/postgresql-original.svg'           },
    { name: 'Pandas',           icon: 'assets/icons/pandas-original.svg'               },
    { name: 'PySpark',          icon: 'assets/icons/apachespark-original.svg'          },
    { name: 'Airflow',          icon: 'assets/icons/apacheairflow-original.svg'        },
    { name: 'Docker',           icon: 'assets/icons/docker-original.svg'               },
    { name: 'Git',              icon: 'assets/icons/git-original.svg'                  },
    { name: 'AWS',              icon: 'assets/icons/amazonwebservices-original-wordmark.svg' },
    { name: 'FastAPI',          icon: 'assets/icons/fastapi-original.svg'              },
    { name: 'RAG',              icon: 'assets/icons/database-svgrepo-com.svg'          },
    { name: 'LangChain',        icon: 'assets/icons/langchain.svg'                     },
    { name: 'pytest',           icon: 'assets/icons/pytest-original.svg'               },
  ];

  socials = {
    linkedin:  'https://www.linkedin.com/in/ali-ahmed-de/',
    github:    'https://github.com/Ali-Ahmed-Farag',
    whatsapp:  'https://wa.me/201220485230',
  };

  constructor(private router: Router) {
    super();
  }

  ngOnInit() {
    this.initPageTransition(this.router);
  }

  protected override onEdgeScrollDown() {
    this.startTransition('Projects', '/projects');
  }

  protected override onEdgeScrollUp() {
    this.startTransition('Home', '/');
  }
}
