import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { VideoCaptureService } from 'client/src/app/services/capture/video-capture.service';
import { MultiplayerService } from 'client/src/app/services/multiplayer/multiplayer.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessagesContainer') private messageList!: ElementRef;

  public isCalibrating: boolean = false;

  public messageBeingTyped: string = '';
  private oldScrollHeight = 0;

  constructor(
    public multiplayer: MultiplayerService,
    private router: Router,
    private route: ActivatedRoute,
    private videoCaptureService: VideoCaptureService,
    ) {}

    ngAfterViewChecked() {
      if (this.oldScrollHeight !== this.messageList.nativeElement.scrollHeight) {
        this.scrollToBottom();
        this.oldScrollHeight = this.messageList.nativeElement.scrollHeight;
      }
    }
  
    scrollToBottom(): void {
      try {
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
      } catch(err) { }    
    }

  public hideCalibrationPage() {
    this.isCalibrating = false;
  }

  public showCalibrationPage() {
    this.isCalibrating = true;
  }

  public getCaptureFPS(): number {
    return this.videoCaptureService.getFPS();
  }

  public getHostText(): string {
    if (this.multiplayer.getIsAdmin()) {
      return "You are the host";
    } else if (this.multiplayer.getIfAdminInRoom()) {
      return "Hosted by " + this.multiplayer.getAdminName();
    } else {
      return `Host (${this.multiplayer.getAdminName()}) left the room`;
    }
  }

  // prompt user to confirm exiting the match
  public exitMatchPrompt() {
    if (confirm("Are you sure you want to exit the match? You won't be able to rejoin unless the host sends you a new access code.")) {
      this.multiplayer.exitMatch();
    }
  }

  ngOnInit(): void {

    // Subscribe to paramMap to get the route parameters
    this.route.queryParams.subscribe(async params => {
      // Get room ID
      const roomID = params['room'];

      // attempt to join room as spectator
      if (roomID) {
        const {status, content} = await fetchServer(Method.GET, '/api/multiplayer/does-room-exist', {
          roomID: roomID
        });
        if (status === 200 && content['success']) {
          // room exists
          this.multiplayer.onJoinRoom(roomID, undefined); // join as spectator (no slot)
        }
      }

      // redirect if multiplayer service isn't in a valid room
      if (!this.multiplayer.isInRoom()) {
        console.log('not a valid room. redirecting to play-portal');
        this.router.navigate(['/play-portal']);
        return
      }

      // set URL to the current room without reloading the page 
      this.setRoomURL();

      this.multiplayer.onEnterPage();

    });
  }

  // set URL to the current room without reloading the page
  setRoomURL() {
    if (!this.multiplayer.isInRoom()) return;
    window.history.replaceState({}, "", `/multiplayer?room=${this.multiplayer.getRoomID()}`);
  }

  ngOnDestroy(): void {
    this.multiplayer.onLeavePage();
  }

  sendMessage() {

    this.multiplayer.sendMessage(this.messageBeingTyped);

    // clear message
    this.messageBeingTyped = '';
  }

}
