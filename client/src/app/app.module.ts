import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { VideoCaptureComponent } from './components/video-capture/video-capture.component';
import { TestComponent } from './test/test.component';
import { InteractiveTetrisBoardComponent } from './components/tetris/interactive-tetris-board/interactive-tetris-board.component';
import { TetrisBlockComponent } from './components/tetris/tetris-block/tetris-block.component';
import { AppRoutingModule } from './app-routing.module';
import { RootComponent } from './components/layout/root-components/root/root.component';
import { PlayPageComponent } from './components/layout/play-page/play-page.component';
import { AnalyzePageComponent } from './components/layout/analyze-page/analyze-page.component';
import { PuzzlesPageComponent } from './components/layout/puzzles-page/puzzles-page.component';
import { LeaderboardPageComponent } from './components/layout/leaderboard-page/leaderboard-page.component';
import { ProfilePageComponent } from './components/layout/profile-page/profile-page.component';
import { HomePageComponent } from './components/layout/home-page/home-page.component';
import { PageLinkComponent } from './components/layout/root-components/page-link/page-link.component';
import { LoginPageComponent } from './components/layout/login-page/login-page.component';
import { LoginButtonComponent } from './components/layout/root-components/login-button/login-button.component';
import { ButtonComponent } from './components/BLOCK/button/button.component';
@NgModule({
  declarations: [
    AppComponent,
    VideoCaptureComponent,
    TestComponent,
    InteractiveTetrisBoardComponent,
    TetrisBlockComponent,
    RootComponent,
    PlayPageComponent,
    AnalyzePageComponent,
    PuzzlesPageComponent,
    LeaderboardPageComponent,
    ProfilePageComponent,
    HomePageComponent,
    PageLinkComponent,
    LoginPageComponent,
    LoginButtonComponent,
    ButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }