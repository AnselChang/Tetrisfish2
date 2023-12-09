import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './components/layout/root-components/root/root.component';
import { HomePageComponent } from './components/layout/home-page/home-page.component';
import { PlayPageComponent } from './components/layout/play-components/play-page/play-page.component';
import { AnalyzePageComponent } from './components/layout/analyze-page/analyze-page.component';
import { PuzzlesPageComponent } from './components/layout/puzzles-page/puzzles-page.component';
import { LeaderboardPageComponent } from './components/layout/leaderboard-page/leaderboard-page.component';
import { ProfilePageComponent } from './components/layout/profile-page/profile-page.component';
import { MorePageComponent } from './components/layout/more-components/more-page/more-page.component';
import { BoardCreationPageComponent } from './components/layout/board-creation-components/board-creation-page/board-creation-page.component';
import { DebugGameComponent } from './components/layout/debug-game/debug-game.component';
import { OnLoginComponent } from './components/layout/on-login/on-login.component';
import { GameAnalysisPageComponent } from './components/layout/game-analysis-components/game-analysis-page/game-analysis-page.component';
import { PlayPortalComponent } from './components/layout/play-portal/play-portal.component';
import { MultiplayerComponent } from './components/layout/multiplayer-components/multiplayer/multiplayer.component';
import { MlDatasetComponent } from './components/layout/ml-dataset/ml-dataset.component';
import { BotPlaygroundComponent } from './components/layout/bot-playground-components/bot-playground/bot-playground.component';

const routes: Routes = [
  // { path: 'login', component: LoginPageComponent},
  {
    path: '',
    component: RootComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'play-portal', component: PlayPortalComponent },
      { path: 'play', component: PlayPageComponent } ,
      { path: 'multiplayer', component: MultiplayerComponent },
      { path: 'analysis', component: AnalyzePageComponent },
      { path: 'analyze-game', component: GameAnalysisPageComponent },
      { path: 'puzzles', component: PuzzlesPageComponent },
      { path: 'leaderboard', component: LeaderboardPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'more', component: MorePageComponent },
      { path: 'board-creation', component: BoardCreationPageComponent },
      { path: 'debug', component: DebugGameComponent },
      { path: 'on-login', component: OnLoginComponent },
      { path: 'ml-dataset', component: MlDatasetComponent },
      { path: 'bot-playground', component: BotPlaygroundComponent },
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
