import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-about-us',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutUs {}