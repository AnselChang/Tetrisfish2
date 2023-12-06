import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import ColorGrid from "../../models/tetronimo-models/color-grid";
import { decodeColorGrid } from "../../scripts/encode-color-grid";

export class SlotBoardData {

    public readonly binaryGrid: BinaryGrid;
    public readonly colorGrid: ColorGrid;
  
    constructor(encodedBoardGame?: Uint8Array) {
      if (!encodedBoardGame) {
        this.binaryGrid = new BinaryGrid();
        this.colorGrid = new ColorGrid();
      }
  
      const {binaryGrid, colorGrid} = decodeColorGrid(encodedBoardGame);
      this.binaryGrid = binaryGrid;
      this.colorGrid = colorGrid;
    }
  }
  
export class SlotBoardDataManager {
    private allSlotBoardData: {[slotID: string]: SlotBoardData} = {};
  
    public getSlotBoardData(slotID: string): SlotBoardData {
  
      if (!this.allSlotBoardData[slotID]) {
        this.allSlotBoardData[slotID] = new SlotBoardData();
      }
      return this.allSlotBoardData[slotID];
    }
  
    public setSlotBoardData(slotID: string, encodedBoardGame?: Uint8Array) {
      this.allSlotBoardData[slotID] = new SlotBoardData(encodedBoardGame);
      console.log('setSlotBoardData', slotID, encodedBoardGame, this.allSlotBoardData[slotID]);
    }
  }