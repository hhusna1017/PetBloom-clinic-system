import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './service.html',
  styleUrl: './service.css'
})
export class Services {}