import { Component, OnInit } from '@angular/core';
import { fakeMoveGeneration } from 'client/src/app/machine-learning/fake-move-generation';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';

@Component({
  selector: 'app-development-testbed',
  templateUrl: './development-testbed.component.html',
  styleUrls: ['./development-testbed.component.scss']
})
export class DevelopmentTestbedComponent implements OnInit {

  ngOnInit(): void {

    // test fake move generation
    const testBoard = new BinaryGrid();
    const placements = fakeMoveGeneration(testBoard, TetrominoType.T_TYPE);

    // debug: print all placements
    for (const placement of placements) {
      placement.print();
    }
  }

}
