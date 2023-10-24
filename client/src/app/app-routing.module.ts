import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './components/layout/root-components/root/root.component';
import { HomePageComponent } from './components/layout/home-page/home-page.component';
import { PlayPageComponent } from './components/layout/play-page/play-page.component';
import { AnalyzePageComponent } from './components/layout/analyze-page/analyze-page.component';
import { PuzzlesPageComponent } from './components/layout/puzzles-page/puzzles-page.component';
import { LeaderboardPageComponent } from './components/layout/leaderboard-page/leaderboard-page.component';
import { ProfilePageComponent } from './components/layout/profile-page/profile-page.component';

const routes: Routes = [
  {
    path: '',
    component: RootComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'play', component: PlayPageComponent} ,
      { path: 'analysis', component: AnalyzePageComponent },
      { path: 'puzzles', component: PuzzlesPageComponent },
      { path: 'leaderboard', component: LeaderboardPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: '**', redirectTo: 'home' },
      { path: '', redirectTo: 'home', pathMatch: 'full' } // default child route
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
