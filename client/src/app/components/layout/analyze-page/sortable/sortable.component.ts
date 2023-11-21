import { Component, Input } from '@angular/core';
import { GameHistoryCacheService } from 'client/src/app/services/game-history-cache.service';
import { GameHistoryGame } from 'shared/models/game-history-game';

@Component({
  selector: 'app-sortable',
  templateUrl: './sortable.component.html',
  styleUrls: ['./sortable.component.scss']
})
export class SortableComponent {
  @Input() key!: keyof GameHistoryGame;
  @Input() label!: string;

  constructor(
    private gameHistoryCache: GameHistoryCacheService
  ) {}

  public sortBy(key: keyof GameHistoryGame): void {
    this.gameHistoryCache.setSortKey(key);
  }

  public isSortedBy(key: keyof GameHistoryGame): boolean {
    return this.gameHistoryCache.getSortKey() === key;
  }

  public isSortedDescending(): boolean {
    return this.gameHistoryCache.getSortDescending();
  }
}
