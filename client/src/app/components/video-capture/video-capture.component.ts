// video-capture.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.scss']
})
export class VideoCaptureComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  videoDevices: (MediaDeviceInfo | null)[] = [];
  selectedDevice: MediaDeviceInfo | null = null;
  permissionError: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.generateVideoDevicesList();
    navigator.mediaDevices.addEventListener('devicechange', this.generateVideoDevicesList.bind(this));
  
  }


  generateVideoDevicesList(): void {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.videoDevices.unshift(null); // Add a null option to the beginning of the list
    });
  }

  onDeviceChange(): void {
    this.startVideo();
  }

  startVideo(): void {
    if (this.selectedDevice) {
      navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.selectedDevice.deviceId
        }
      }).then(stream => {

        console.log(stream.getVideoTracks());

        this.videoElement.nativeElement.srcObject = stream;
        this.permissionError = null; // Clear any previous error
      }).catch(err => {
        this.permissionError = "Error accessing video device. Please ensure permissions are granted.";
        console.error("Error accessing video device:", err);
      });
    } else {
      // If no device is selected, clear the video element
      this.videoElement.nativeElement.srcObject = null;
    }
  }
}
