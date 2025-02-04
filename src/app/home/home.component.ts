import { Component } from '@angular/core';
import { Router } from '@angular/router';

//font awsome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {
  faDesktop,
  faServer,
  faRobot,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  faRobot = faRobot;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faDesktop = faDesktop;
  faServer = faServer;

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
