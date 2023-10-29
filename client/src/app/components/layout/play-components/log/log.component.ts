import { Component, Input } from '@angular/core';
import { LogMessage } from '../play-page/play-page.component';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent {
  @Input() logs: LogMessage[] = [];

}
