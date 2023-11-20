import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './components/layout/root-components/root/root.component';
import { HomePageComponent } from './components/layout/home-page/home-page.component';
import { PlayPageComponent } from './components/layout/play-components/play-page/play-page.component';
import { AnalyzePageComponent } from './components/layout/analyze-page/analyze-page.component';
import { PuzzlesPageComponent } from './components/layout/puzzles-page/puzzles-page.component';
import { LeaderboardPageComponent } from './components/layout/leaderboard-page/leaderboard-page.component';
import { ProfilePageComponent } from './components/layout/profile-page/profile-page.component';
import { LoginPageComponent } from './components/layout/login-page/login-page.component';
import { MorePageComponent } from './components/layout/more-components/more-page/more-page.component';
import { BoardCreationPageComponent } from './components/layout/board-creation-components/board-creation-page/board-creation-page.component';
import { CalibratePageComponent } from './components/layout/calibrate-components/calibrate-page/calibrate-page.component';
import { DebugGameComponent } from './components/layout/debug-game/debug-game.component';
import { PlayCalibrateComponent } from './components/layout/play-calibrate/play-calibrate.component';
import { HowToPlayComponent } from './components/layout/play-components/how-to-play/how-to-play.component';
import { OnLoginComponent } from './components/layout/on-login/on-login.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent},
  {
    path: '',
    component: RootComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'play', component: PlayPageComponent } ,
      { path: 'calibrate', component: CalibratePageComponent },
      { path: 'how-to-play', component: HowToPlayComponent },
      { path: 'play-calibrate', component: PlayCalibrateComponent },
      { path: 'analysis', component: AnalyzePageComponent },
      { path: 'puzzles', component: PuzzlesPageComponent },
      { path: 'leaderboard', component: LeaderboardPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'more', component: MorePageComponent },
      { path: 'board-creation', component: BoardCreationPageComponent },
      { path: 'debug', component: DebugGameComponent },
      { path: 'on-login', component: OnLoginComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'home' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
